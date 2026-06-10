export const IMAGE_MAKE_HISTORY_STORAGE_KEY = 'ai-design-to-web.image-make.history.v1'

export const STUDIO_TEMPLATES = [
  {
    id: 'mobile-app-home',
    title: '移动 App 首页',
    shortTitle: 'App 首页',
    type: '移动端',
    description: '适合从一个 App 首页概念开始，生成 UI 设计图、资产、HTML 预览和导出包。',
    prompt: '为一个移动 App 生成首页高保真 UI 设计图。页面需要包含顶部定位/搜索、核心功能入口、主视觉 Banner、推荐内容卡片、关键 CTA、信任或服务保障信息，以及底部导航。风格要求现代、清晰、中文文案真实可读，目标是 iPhone 纵向移动端页面。'
  },
  {
    id: 'saas-console',
    title: 'SaaS 控制台',
    shortTitle: 'SaaS 控制台',
    type: 'Web',
    description: '适合 B2B、运营后台、数据面板和管理控制台的早期页面方案。',
    prompt: '为一个 SaaS 产品生成控制台首页高保真 UI 设计图。页面需要包含侧边导航、顶部操作栏、核心指标卡、趋势图区域、任务/告警列表、最近活动和主要操作入口。风格要求克制、专业、信息密度适中，中文文案真实可读，目标是可还原为网页原型。'
  },
  {
    id: 'ecommerce-campaign',
    title: '电商活动页',
    shortTitle: '活动页',
    type: '营销页',
    description: '适合促销、品牌活动、商品专题和增长实验页面。',
    prompt: '为一个电商活动页生成高保真 UI 设计图。页面需要包含活动主视觉、优惠信息、商品推荐区、倒计时/权益标签、购买 CTA、服务保障和底部转化模块。风格要求有商业吸引力但不杂乱，中文文案真实可读，目标是可生成 HTML 预览和导出包。'
  }
]

export function getStudioTemplate(templateId) {
  return STUDIO_TEMPLATES.find((template) => template.id === templateId) || null
}

export function getStudioTemplateHref(template) {
  return `/image-make?template=${encodeURIComponent(template.id)}`
}

export function readLocalImageMakeHistory() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(IMAGE_MAKE_HISTORY_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function mergeImageMakeHistory(...groups) {
  const byId = new Map()
  groups.flat().filter(Boolean).forEach((entry) => {
    const id = String(entry.id || '').trim()
    if (!id) return
    const previous = byId.get(id)
    if (!previous || getEntryTime(entry) >= getEntryTime(previous)) {
      byId.set(id, entry)
    }
  })

  return [...byId.values()]
    .sort((a, b) => getEntryTime(b) - getEntryTime(a))
    .slice(0, 50)
}

export function normalizeImageMakeProject(entry) {
  const data = asObject(entry?.data)
  const assets = Array.isArray(data.assets) ? data.assets : []
  const successfulAssetCount = assets.filter((asset) => asset?.status === 'success' && asset?.resultUrl).length
  const assetCount = Number(entry?.assetCount || data.assetCount || assets.length || 0)
  const htmlReady = Boolean(entry?.htmlReady || data.html)
  const hasReview = Boolean(data.htmlDualReview || data.visualReview || data.codeReview)
  const designUrl = entry?.designUrl || data.design?.resultUrl || data.design?.localUrl || ''
  const prompt = entry?.prompt || data.prompt || ''
  const title = entry?.title || titleFromPrompt(prompt) || '未命名任务'
  const updatedAt = entry?.updatedAt || data.savedAt || entry?.createdAt || ''
  const id = entry?.id || `${title}-${updatedAt}`
  const currentStep = getProjectStep({ htmlReady, assetCount, designUrl, hasReview })
  const failureState = normalizeFailureState(data.failureState || data.lastFailure, currentStep)
  const exportReadiness = getExportReadiness({ designUrl, assetCount, successfulAssetCount, htmlReady, hasReview })
  const nextAction = failureState
    ? getFailureNextAction(failureState)
    : getNextAction({ htmlReady, assetCount, designUrl, hasReview })
  const artifactSummary = getArtifactSummary({ htmlReady, assetCount, successfulAssetCount, designUrl, hasReview })

  return {
    id,
    projectId: data.projectId || id,
    runId: data.runId || id,
    title,
    prompt,
    currentStep,
    currentStage: currentStep.label,
    nextAction,
    artifactSummary,
    artifactStatus: artifactSummary.label,
    exportReadiness,
    failureState,
    continueLabel: nextAction.label,
    updatedAt,
    updatedLabel: formatProjectTime(updatedAt),
    href: entry?.id ? `/image-make?history=${encodeURIComponent(entry.id)}` : '/image-make',
    source: entry?.source || 'history',
    raw: entry
  }
}

export function mapImageMakeProject(entry) {
  return normalizeImageMakeProject(entry)
}

export function formatProjectTime(value) {
  if (!value) return '最近保存'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '最近保存'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getEntryTime(entry) {
  const date = new Date(entry?.updatedAt || entry?.data?.savedAt || entry?.createdAt || 0)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function getProjectStep({ htmlReady, assetCount, designUrl, hasReview }) {
  if (hasReview) return { id: 'review', label: '复核', title: '复核结果已生成' }
  if (htmlReady) return { id: 'html', label: 'HTML', title: 'HTML 预览已生成' }
  if (assetCount) return { id: 'assets', label: '资产', title: '页面资产已生成' }
  if (designUrl) return { id: 'design', label: '设计', title: 'UI 设计图已生成' }
  return { id: 'requirement', label: '需求', title: '需求草稿' }
}

function getArtifactSummary({ htmlReady, assetCount, successfulAssetCount, designUrl, hasReview }) {
  const parts = []
  if (designUrl) parts.push('UI 设计图')
  if (assetCount) {
    parts.push(successfulAssetCount && successfulAssetCount !== assetCount
      ? `${successfulAssetCount}/${assetCount} 个视觉资产`
      : `${assetCount} 个视觉资产`)
  }
  if (htmlReady) parts.push('HTML 预览')
  if (hasReview) parts.push('复核结果')
  return {
    label: parts.length ? parts.join(' · ') : '草稿',
    hasDesign: Boolean(designUrl),
    assetCount,
    successfulAssetCount,
    htmlReady,
    hasReview
  }
}

function getNextAction({ htmlReady, assetCount, designUrl, hasReview }) {
  if (hasReview) return { id: 'export', label: '继续导出', hint: '复核完成后可以下载 HTML 素材包或 Figma 导入包。' }
  if (htmlReady) return { id: 'review', label: '继续复核', hint: '检查 HTML 预览并按需要自动修复。' }
  if (assetCount) return { id: 'html', label: '继续生成 HTML', hint: '用设计图和视觉资产生成可预览网页。' }
  if (designUrl) return { id: 'assets', label: '继续生成资产', hint: '基于 UI 设计图补齐页面视觉资产。' }
  return { id: 'design', label: '继续生成原型', hint: '先生成 UI 设计图。' }
}

function getExportReadiness({ designUrl, assetCount, successfulAssetCount, htmlReady, hasReview }) {
  const hasOutput = Boolean(designUrl || assetCount || htmlReady || hasReview)
  return {
    projectJson: {
      ready: hasOutput,
      label: hasOutput ? '可导出项目 JSON' : '生成任一产物后可导出项目 JSON',
      reason: hasOutput ? '包含当前任务快照和复核信息，不是服务器项目记录。' : '需要先生成 UI 设计图、资产或 HTML。'
    },
    htmlPackage: {
      ready: htmlReady,
      label: htmlReady ? '可导出 HTML 素材包' : '生成 HTML 后可导出 HTML 素材包',
      reason: htmlReady ? '包含 index.html、素材、manifest 和任务说明。' : '至少需要 HTML 预览。'
    },
    figmaPackage: {
      ready: Boolean(designUrl && (htmlReady || successfulAssetCount)),
      label: designUrl && (htmlReady || successfulAssetCount) ? '可导出 Figma 导入包' : '设计图加 HTML 或资产后可导出 Figma 导入包',
      reason: designUrl ? '推荐的 Figma 路线：用本地插件导入设计图、资产、HTML 截图和节点骨架。' : '至少需要 UI 设计图。'
    },
    experimentalFig: {
      ready: hasOutput,
      label: hasOutput ? '可导出实验 .fig 交接文件' : '生成任一产物后可导出实验 .fig',
      reason: '实验格式用于 Agent/OpenPencil 交接，不等同于 Figma 原生文件，也不保证能被 Figma 打开。'
    },
    summary: htmlReady
      ? 'HTML 素材包已就绪'
      : hasOutput
        ? '已有部分产物，可先导出项目 JSON'
        : '等待生成产物'
  }
}

function normalizeFailureState(value, currentStep) {
  if (!value || typeof value !== 'object') return null
  const failedStep = String(value.failedStep || value.step || '').trim()
  const message = String(value.message || '').trim()
  if (!failedStep && !message) return null

  return {
    failedStep: failedStep || currentStep.id,
    label: getFailureStepLabel(failedStep || currentStep.id),
    message: message || '执行失败，可从当前步骤重试。',
    failedAt: value.failedAt || value.timestamp || '',
    retryAction: value.retryAction || getFailureRetryLabel(failedStep || currentStep.id)
  }
}

function getFailureNextAction(failureState) {
  return {
    id: failureState.failedStep,
    label: failureState.retryAction,
    hint: `${failureState.label}失败：${failureState.message}`
  }
}

export function getFailureStepLabel(step) {
  const labels = {
    design: '设计生成',
    assets: '资产生成',
    'missing-assets': '缺失资产扫描',
    html: 'HTML 生成',
    'html-repair': '复核修复',
    'html-review-assets': '复核补资产',
    export: '导出'
  }
  return labels[step] || '当前步骤'
}

export function getFailureRetryLabel(step) {
  const labels = {
    design: '重试生成 UI 设计图',
    assets: '重试生成页面资产',
    'missing-assets': '重试扫描缺失切图',
    html: '重试生成 HTML',
    'html-repair': '重试复核并修复',
    'html-review-assets': '重试生成缺失资产',
    export: '重试导出'
  }
  return labels[step] || '重试当前步骤'
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function titleFromPrompt(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text.length > 24 ? `${text.slice(0, 24)}...` : text
}
