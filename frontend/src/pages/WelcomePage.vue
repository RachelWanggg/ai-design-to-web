<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Boxes, Clock3, KeyRound, LayoutDashboard, Settings2, Sparkles } from 'lucide-vue-next'

const HISTORY_STORAGE_KEY = 'ai-design-to-web.image-make.history.v1'
const recentProjects = ref([])

const hasRecentProjects = computed(() => recentProjects.value.length > 0)

function openModelSettings() {
  window.dispatchEvent(new CustomEvent('open-model-settings'))
}

function loadRecentProjects() {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    const entries = JSON.parse(raw || '[]')
    recentProjects.value = Array.isArray(entries)
      ? entries
        .slice()
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 4)
      : []
  } catch {
    recentProjects.value = []
  }
}

function projectTitle(entry) {
  return entry.title || entry.prompt || '未命名项目'
}

function projectMeta(entry) {
  const parts = []
  const assetCount = entry.assetCount || entry.data?.assets?.length || 0
  if (entry.htmlReady || entry.data?.html) parts.push('HTML')
  if (assetCount) parts.push(`${assetCount} 个资产`)
  if (entry.designUrl || entry.data?.design) parts.push('设计图')
  return parts.length ? parts.join(' · ') : '已保存草稿'
}

function formatProjectTime(value) {
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

onMounted(() => {
  loadRecentProjects()
})
</script>

<template>
  <main class="welcome-main">
    <section class="welcome-hero">
      <div class="welcome-copy">
        <p class="eyebrow">AI Design to Web</p>
        <h2>从一句需求开始生成可预览的网页原型</h2>
        <p>
          默认流程会先生成 UI 设计图，再补齐视觉资产、生成 HTML，并提供复核和导出入口。
          高级 Agent 编排仍保留在独立模式中。
        </p>
        <div class="welcome-actions">
          <a class="button button-primary welcome-primary-action" href="/image-make">
            <Sparkles :size="17" />
            开始生成
            <ArrowRight :size="17" />
          </a>
          <a class="button button-secondary" href="/make">
            <Boxes :size="17" />
            高级模式
          </a>
        </div>
      </div>

      <div class="welcome-flow" aria-label="生成流程">
        <div>
          <span>1</span>
          <strong>需求</strong>
        </div>
        <div>
          <span>2</span>
          <strong>设计</strong>
        </div>
        <div>
          <span>3</span>
          <strong>资产</strong>
        </div>
        <div>
          <span>4</span>
          <strong>HTML</strong>
        </div>
        <div>
          <span>5</span>
          <strong>复核</strong>
        </div>
        <div>
          <span>6</span>
          <strong>导出</strong>
        </div>
      </div>
    </section>

    <section class="welcome-grid" aria-label="开始选项">
      <article class="welcome-start-card">
        <div class="welcome-card-icon">
          <Sparkles :size="20" />
        </div>
        <div>
          <h3>生成工作台</h3>
          <p>适合从产品描述或参考图开始，按设计、资产、HTML、复核的顺序完成页面原型。</p>
        </div>
        <a class="button button-primary" href="/image-make">
          进入工作台
          <ArrowRight :size="16" />
        </a>
      </article>

      <article class="welcome-start-card">
        <div class="welcome-card-icon">
          <Settings2 :size="20" />
        </div>
        <div>
          <h3>模型设置</h3>
          <p>配置本机浏览器保存的模型 Key、供应商预设和 Agent 绑定，设置后再开始生成。</p>
        </div>
        <button class="button button-secondary" type="button" @click="openModelSettings">
          <KeyRound :size="16" />
          打开设置
        </button>
      </article>

      <article class="welcome-start-card">
        <div class="welcome-card-icon">
          <LayoutDashboard :size="20" />
        </div>
        <div>
          <h3>控制台</h3>
          <p>查看原有阶段看板、文档库、Agent 执行台和项目规划器。</p>
        </div>
        <a class="button button-secondary" href="/dashboard">
          查看控制台
        </a>
      </article>
    </section>

    <section class="welcome-recents" aria-label="最近项目">
      <div class="welcome-section-head">
        <div>
          <p class="eyebrow">Recent</p>
          <h2>最近项目</h2>
        </div>
        <a class="button button-secondary" href="/image-make">打开生成工作台</a>
      </div>

      <div v-if="hasRecentProjects" class="welcome-recent-list">
        <a
          v-for="entry in recentProjects"
          :key="entry.id"
          class="welcome-recent-item"
          href="/image-make"
        >
          <Clock3 :size="17" />
          <span>
            <strong>{{ projectTitle(entry) }}</strong>
            <small>{{ projectMeta(entry) }} · {{ formatProjectTime(entry.updatedAt || entry.createdAt) }}</small>
          </span>
          <ArrowRight :size="16" />
        </a>
      </div>

      <div v-else class="welcome-empty">
        <Clock3 :size="18" />
        <p>还没有可展示的最近项目。完成一次生成后，这里会显示本机保存的历史。</p>
      </div>
    </section>
  </main>
</template>
