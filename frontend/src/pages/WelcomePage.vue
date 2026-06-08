<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Boxes, CheckCircle2, Clock3, FolderKanban, KeyRound, LayoutDashboard, Settings2, Sparkles } from 'lucide-vue-next'
import { getImageMakeRuns } from '../services/api'
import { loadAgentRuntimeSettings } from '../services/agentRuntime'
import {
  STUDIO_TEMPLATES,
  getStudioTemplateHref,
  mapImageMakeProject,
  mergeImageMakeHistory,
  readLocalImageMakeHistory
} from '../services/projectHistory'

const recentProjects = ref([])
const runtimeSettings = ref(loadAgentRuntimeSettings())
const historySyncMessage = ref('')

const hasRecentProjects = computed(() => recentProjects.value.length > 0)
const projectCards = computed(() => recentProjects.value.map(mapImageMakeProject).slice(0, 4))
const modelReady = computed(() => Boolean(runtimeSettings.value?.browserDirectEnabled))
const templates = STUDIO_TEMPLATES

function openModelSettings() {
  window.dispatchEvent(new CustomEvent('open-model-settings'))
}

async function loadRecentProjects() {
  const localEntries = readLocalImageMakeHistory()
  recentProjects.value = localEntries.slice(0, 4)

  try {
    const payload = await getImageMakeRuns(20)
    const remoteEntries = Array.isArray(payload?.runs) ? payload.runs : []
    recentProjects.value = mergeImageMakeHistory(localEntries, remoteEntries).slice(0, 4)
    historySyncMessage.value = remoteEntries.length ? '本地 + SQLite' : '本地历史'
  } catch {
    recentProjects.value = localEntries.slice(0, 4)
    historySyncMessage.value = localEntries.length ? '本地历史' : ''
  }
}

function templateHref(template) {
  return getStudioTemplateHref(template)
}

onMounted(() => {
  runtimeSettings.value = loadAgentRuntimeSettings()
  loadRecentProjects()
})
</script>

<template>
  <main class="welcome-main">
    <section class="welcome-hero">
      <div class="welcome-copy">
        <p class="eyebrow">AI Design to Web</p>
        <h2>输入产品或页面需求，生成可交付网页原型</h2>
        <p>
          系统会按顺序产出 UI 设计图、视觉资产、HTML 预览、复核结果和导出包。
          默认入口是生成工作台；Agent 编排和阶段调试保留在高级工具里。
        </p>
        <div class="welcome-actions">
          <a class="button button-primary welcome-primary-action" href="/image-make">
            <Sparkles :size="17" />
            开始生成原型
            <ArrowRight :size="17" />
          </a>
          <a class="button button-secondary" href="/dashboard">
            <FolderKanban :size="17" />
            查看项目
          </a>
        </div>
        <div class="welcome-model-status" :class="{ 'is-ready': modelReady }">
          <CheckCircle2 v-if="modelReady" :size="16" />
          <Settings2 v-else :size="16" />
          <span>{{ modelReady ? '模型已就绪' : '建议配置模型' }}</span>
          <button type="button" @click="openModelSettings">
            <KeyRound :size="14" />
            模型设置
          </button>
        </div>
      </div>

      <div class="welcome-flow-panel">
        <div class="welcome-flow-head">
          <p class="eyebrow">Workflow</p>
          <h2>生成流程</h2>
          <p>这些不是入口按钮，而是你从需求到导出会经过的产物阶段。</p>
        </div>
        <div class="welcome-flow" aria-label="生成流程">
          <div>
            <span>1</span>
            <strong>需求</strong>
            <small>描述页面目标</small>
          </div>
          <div>
            <span>2</span>
            <strong>设计</strong>
            <small>生成 UI 设计图</small>
          </div>
          <div>
            <span>3</span>
            <strong>资产</strong>
            <small>补齐视觉素材</small>
          </div>
          <div>
            <span>4</span>
            <strong>HTML</strong>
            <small>生成页面预览</small>
          </div>
          <div>
            <span>5</span>
            <strong>复核</strong>
            <small>检查并修复</small>
          </div>
          <div>
            <span>6</span>
            <strong>导出</strong>
            <small>交付项目包</small>
          </div>
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
          <p>默认路径。从需求或参考图开始，依次生成设计图、资产、HTML、复核结果和导出包。</p>
        </div>
        <a class="button button-primary" href="/image-make">
          进入工作台
          <ArrowRight :size="16" />
        </a>
      </article>

      <article class="welcome-start-card">
        <div class="welcome-card-icon">
          <LayoutDashboard :size="20" />
        </div>
        <div>
          <h3>项目</h3>
          <p>查看本机和 SQLite 保存的生成历史，按当前阶段继续完成产物。</p>
        </div>
        <a class="button button-secondary" href="/dashboard">
          查看项目
        </a>
      </article>

      <article class="welcome-start-card">
        <div class="welcome-card-icon">
          <Boxes :size="20" />
        </div>
        <div>
          <h3>高级工具</h3>
          <p>用于 Agent 编排、阶段调试、批量设计/切图路线设置，不作为新手默认入口。</p>
        </div>
        <a class="button button-secondary" href="/make">
          进入高级工具
        </a>
      </article>
    </section>

    <section class="welcome-recents" aria-label="最近项目">
      <div class="welcome-section-head">
        <div>
          <p class="eyebrow">{{ historySyncMessage || 'Projects' }}</p>
          <h2>最近项目</h2>
        </div>
        <a class="button button-secondary" href="/dashboard">查看全部项目</a>
      </div>

      <div v-if="hasRecentProjects" class="welcome-recent-list">
        <a
          v-for="project in projectCards"
          :key="project.id"
          class="welcome-recent-item"
          :href="project.href"
        >
          <Clock3 :size="17" />
          <span>
            <strong>{{ project.title }}</strong>
            <small>
              {{ project.failureState ? '需恢复' : project.currentStage }} ·
              {{ project.failureState ? project.failureState.retryAction : project.artifactStatus }} ·
              {{ project.updatedLabel }}
            </small>
          </span>
          <ArrowRight :size="16" />
        </a>
      </div>

      <div v-else class="template-card-grid" aria-label="示例模板">
        <a v-for="template in templates" :key="template.id" class="template-card" :href="templateHref(template)">
          <span>{{ template.type }}</span>
          <strong>{{ template.title }}</strong>
          <p>{{ template.description }}</p>
          <small>预填需求，不自动生成</small>
        </a>
      </div>
    </section>
  </main>
</template>
