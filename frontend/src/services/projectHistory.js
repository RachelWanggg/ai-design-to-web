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

export function mapImageMakeProject(entry) {
  const data = entry?.data || {}
  const assets = Array.isArray(data.assets) ? data.assets : []
  const assetCount = Number(entry?.assetCount || data.assetCount || assets.length || 0)
  const htmlReady = Boolean(entry?.htmlReady || data.html)
  const hasReview = Boolean(data.htmlDualReview || data.visualReview || data.codeReview)
  const designUrl = entry?.designUrl || data.design?.resultUrl || data.design?.localUrl || ''
  const title = entry?.title || titleFromPrompt(entry?.prompt || data.prompt) || '未命名项目'
  const updatedAt = entry?.updatedAt || data.savedAt || entry?.createdAt || ''

  return {
    id: entry?.id || `${title}-${updatedAt}`,
    title,
    prompt: entry?.prompt || data.prompt || '',
    currentStage: getProjectStageLabel({ htmlReady, assetCount, designUrl, hasReview }),
    artifactStatus: getArtifactStatus({ htmlReady, assetCount, designUrl, hasReview }),
    continueLabel: getContinueLabel({ htmlReady, assetCount, designUrl, hasReview }),
    updatedAt,
    updatedLabel: formatProjectTime(updatedAt),
    href: entry?.id ? `/image-make?history=${encodeURIComponent(entry.id)}` : '/image-make',
    source: entry?.source || 'history'
  }
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

function getProjectStageLabel({ htmlReady, assetCount, designUrl, hasReview }) {
  if (hasReview) return '复核'
  if (htmlReady) return 'HTML'
  if (assetCount) return '资产'
  if (designUrl) return '设计'
  return '需求'
}

function getArtifactStatus({ htmlReady, assetCount, designUrl, hasReview }) {
  const parts = []
  if (designUrl) parts.push('UI 设计图')
  if (assetCount) parts.push(`${assetCount} 个视觉资产`)
  if (htmlReady) parts.push('HTML 预览')
  if (hasReview) parts.push('复核结果')
  return parts.length ? parts.join(' · ') : '草稿'
}

function getContinueLabel({ htmlReady, assetCount, designUrl, hasReview }) {
  if (hasReview) return '继续导出'
  if (htmlReady) return '继续复核'
  if (assetCount) return '继续生成 HTML'
  if (designUrl) return '继续生成资产'
  return '继续生成原型'
}

function titleFromPrompt(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text.length > 24 ? `${text.slice(0, 24)}...` : text
}
