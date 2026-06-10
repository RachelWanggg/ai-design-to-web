<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Clock3, FolderKanban, Layers3, Sparkles } from 'lucide-vue-next'
import {
  getWorkflow,
  getDocument,
  getImageMakeRuns,
  createProjectPlan,
  runAgent,
  updateStageStatus
} from '../services/api'
import { loadAgentRuntimeSettings, runBrowserAgent } from '../services/agentRuntime'
import {
  STUDIO_TEMPLATES,
  getStudioTemplateHref,
  mapImageMakeProject,
  mergeImageMakeHistory,
  readLocalImageMakeHistory
} from '../services/projectHistory'
import MetricsStrip from '../components/MetricsStrip.vue'
import StageBoard from '../components/StageBoard.vue'
import DocumentLibrary from '../components/DocumentLibrary.vue'
import AgentConsole from '../components/AgentConsole.vue'
import ProjectPlanner from '../components/ProjectPlanner.vue'

const loading = ref(true)
const workflowError = ref('')
const workflow = ref(null)
const selectedStageId = ref('')
const selectedDocument = ref(null)
const planning = ref(false)
const projectPlan = ref(null)
const agentLoading = ref(false)
const agentRuns = ref([])
const projectsLoading = ref(true)
const projectEntries = ref([])
const projectsSyncMessage = ref('')

const stages = computed(() => workflow.value?.stages || [])
const documents = computed(() => workflow.value?.documents || [])
const summary = computed(() => workflow.value?.summary || {})
const projectCards = computed(() => projectEntries.value.map(mapImageMakeProject))
const templates = STUDIO_TEMPLATES

const selectedStage = computed(() => {
  return stages.value.find((stage) => stage.id === selectedStageId.value) || stages.value[0]
})

async function loadWorkflow() {
  loading.value = true
  workflowError.value = ''
  try {
    workflow.value = await getWorkflow()
    selectedStageId.value = selectedStageId.value || workflow.value.stages[0]?.id || ''
    if (!selectedDocument.value && workflow.value.documents[0]) {
      await openDocument(workflow.value.documents[0])
    }
  } catch (err) {
    workflowError.value = err.message
  } finally {
    loading.value = false
  }
}

async function openDocument(document) {
  try {
    selectedDocument.value = await getDocument(document.slug)
  } catch (err) {
    workflowError.value = err.message
  }
}

async function changeStatus(stage, status) {
  try {
    const updated = await updateStageStatus(stage.id, status)
    workflow.value.stages = workflow.value.stages.map((item) => {
      return item.id === updated.id ? updated : item
    })
    workflow.value.summary = summarize(workflow.value.stages)
  } catch (err) {
    workflowError.value = err.message
  }
}

async function submitPlan(form) {
  planning.value = true
  workflowError.value = ''
  try {
    projectPlan.value = await createProjectPlan(form)
  } catch (err) {
    workflowError.value = err.message
  } finally {
    planning.value = false
  }
}

async function submitAgentRun(payload) {
  agentLoading.value = true
  workflowError.value = ''
  try {
    const runtimeSettings = loadAgentRuntimeSettings()
    const stage = stages.value.find((item) => item.id === payload.stageId) || selectedStage.value
    const run = runtimeSettings.browserDirectEnabled
      ? await runBrowserAgent({
        request: payload,
        stage,
        documents: await loadRelatedDocuments(payload.stageId, payload.documentSlugs),
        settings: runtimeSettings
      })
      : await runAgent(payload)

    agentRuns.value = [run, ...agentRuns.value].slice(0, 8)
    const statusStageId = run.stageId || run.stageID || payload.stageId
    const statusTarget = stages.value.find((item) => item.id === statusStageId)
    if (run.suggestedStatus && statusTarget?.status === 'pending') {
      await changeStatus(statusTarget, run.suggestedStatus)
    }
  } catch (err) {
    workflowError.value = err.message
  } finally {
    agentLoading.value = false
  }
}

async function loadRelatedDocuments(stageId, documentSlugs = []) {
  const selected = new Set(documentSlugs)
  const related = documents.value.filter((document) => {
    return selected.has(document.slug) || document.stageIds?.includes(stageId)
  })

  return Promise.all(
    related.map(async (document) => {
      if (document.content) return document
      try {
        return await getDocument(document.slug)
      } catch {
        return document
      }
    })
  )
}

function summarize(items) {
  const totalStages = items.length
  const completedStages = items.filter((stage) => stage.status === 'completed').length
  const activeStages = items.filter((stage) => stage.status === 'active').length
  const blockedStages = items.filter((stage) => stage.status === 'blocked').length
  const progress = totalStages
    ? Math.round(items.reduce((total, stage) => total + stage.progress, 0) / totalStages)
    : 0

  return { totalStages, completedStages, activeStages, blockedStages, progress }
}

async function loadProjectCards() {
  projectsLoading.value = true
  const localEntries = readLocalImageMakeHistory()
  projectEntries.value = localEntries

  try {
    const payload = await getImageMakeRuns(50)
    const remoteEntries = Array.isArray(payload?.runs) ? payload.runs : []
    projectEntries.value = mergeImageMakeHistory(localEntries, remoteEntries)
    projectsSyncMessage.value = remoteEntries.length ? '历史记录已同步' : '读取本地历史'
  } catch {
    projectEntries.value = localEntries
    projectsSyncMessage.value = localEntries.length ? '同步失败，正在显示本地历史' : '暂无历史记录'
  } finally {
    projectsLoading.value = false
  }
}

function templateHref(template) {
  return getStudioTemplateHref(template)
}

function historyTitle(project) {
  return project.title === '未命名项目' || project.title === '未命名任务' ? '未命名任务' : project.title
}

onMounted(() => {
  loadProjectCards()
  loadWorkflow()
})
</script>

<template>
  <main class="app-main projects-main">
    <section class="projects-hero">
      <div>
        <p class="eyebrow">Recent Work</p>
        <h2>最近任务</h2>
        <p>这里显示生成工作台自动保存的历史任务、当前阶段、产物状态和继续入口。历史来自浏览器本地记录与 SQLite，不提供项目管理动作。</p>
      </div>
      <a class="button button-primary" href="/image-make">
        <Sparkles :size="17" />
        新建原型
        <ArrowRight :size="17" />
      </a>
    </section>

    <section class="project-status-section">
      <div class="project-section-head">
        <div>
          <p class="eyebrow">Generation History</p>
          <h2>生成历史</h2>
        </div>
        <span>{{ projectsSyncMessage || '读取历史记录' }}</span>
      </div>

      <section v-if="projectsLoading" class="loading-state compact-loading">
        <div class="loading-bar" />
        <p>正在读取历史记录...</p>
      </section>

      <div v-else-if="projectCards.length" class="project-card-grid">
        <article
          v-for="project in projectCards"
          :key="project.id"
          class="project-card"
          :class="{ 'is-failed': project.failureState }"
        >
          <header>
            <span class="project-stage-pill">{{ project.failureState ? '需恢复' : project.currentStage }}</span>
            <small><Clock3 :size="13" /> {{ project.updatedLabel }}</small>
          </header>
          <div>
            <h3>{{ historyTitle(project) }}</h3>
            <p v-if="project.failureState">{{ project.failureState.label }}失败：{{ project.failureState.message }}</p>
            <p v-else>{{ project.prompt || '任务需求保存在历史快照中。' }}</p>
          </div>
          <footer>
            <span><Layers3 :size="14" /> {{ project.artifactStatus }}</span>
            <a class="button button-secondary" :href="project.href">
              {{ project.continueLabel }}
              <ArrowRight :size="15" />
            </a>
          </footer>
        </article>
      </div>

      <div v-else class="template-card-grid" aria-label="示例模板">
        <a v-for="template in templates" :key="template.id" class="template-card" :href="templateHref(template)">
          <span>{{ template.type }}</span>
          <strong>{{ template.title }}</strong>
          <p>{{ template.description }}</p>
          <small>预填需求并进入生成工作台</small>
        </a>
      </div>
    </section>

    <details class="internal-workflow-console">
      <summary>
        <span><FolderKanban :size="17" /> 内部工作流控制台</span>
        <small>阶段看板、文档库、Agent 执行台和项目规划器</small>
      </summary>

      <section v-if="workflowError" class="notice notice-error">
        {{ workflowError }}
      </section>

      <section v-if="loading" class="loading-state">
        <div class="loading-bar" />
        <p>正在载入工作流...</p>
      </section>

      <template v-else>
        <MetricsStrip :summary="summary" />

        <div class="workspace-grid">
          <aside class="workspace-side">
            <DocumentLibrary
              :documents="documents"
              :selected-document="selectedDocument"
              @select="openDocument"
            />
          </aside>

          <section class="workspace-center">
            <StageBoard
              :stages="stages"
              :selected-stage="selectedStage"
              @select="selectedStageId = $event.id"
              @status-change="changeStatus"
            />
          </section>

          <aside class="workspace-side">
            <AgentConsole
              :stages="stages"
              :documents="documents"
              :selected-stage="selectedStage"
              :history="agentRuns"
              :loading="agentLoading"
              @run="submitAgentRun"
            />

            <ProjectPlanner
              :loading="planning"
              :plan="projectPlan"
              @submit="submitPlan"
            />
          </aside>
        </div>
      </template>
    </details>
  </main>
</template>
