# Product IA Redesign Plan

## Purpose

This document is the working plan for the product IA redesign of AI Design to Web. It records the product direction, repository audit findings, information architecture decisions, execution roadmap, and acceptance criteria.

The goal is not only to make the UI cleaner. The goal is to align the public product promise, route structure, first-time user experience, and advanced Agent tooling around one clear product model:

- A user creates a project.
- The project runs through a design-to-web pipeline.
- The user receives reviewable and exportable artifacts.
- Advanced users can inspect or override Agent internals without making those internals the default experience.

## P0 Implementation Status

Status: Done on 2026-06-08.

P0 scope completed:

- Header navigation now uses `开始`, `生成工作台`, `项目`, and `高级工具`.
- `/` is now a start page focused on the product promise and the default prototype-generation CTA.
- `/dashboard` is now a project status page backed by existing image-make history, with the old workflow console preserved as a collapsed internal view.
- `/image-make` is now positioned as `生成工作台`, with a single dominant current-step CTA, front-loaded input/reference/template controls, and advanced rerun/log/prompt/model details moved into collapsed panels.
- `/make` is now positioned as `高级工具` for Agent orchestration, stage debugging, and batch route setup.
- Start and project empty states now expose three example templates: `移动 App 首页`, `SaaS 控制台`, and `电商活动页`.
- No backend API, model runtime, Agent execution logic, persistence schema, or README changes were made in P0.

Verification completed:

- User completed local visual acceptance on 2026-06-08.
- `npm run build` passes in `frontend`.
- `git diff --check` passes.

Deferred to later phases:

- True backend `Project` schema and server-side project lifecycle.
- Deeper visual polish after screenshots across breakpoints.
- README onboarding updates.
- P1/P2 workflow refinements.

## Repository Audit Reset

The 2026-06-08 repository audit changes the priority of this redesign.

The public GitHub README positions AI Design to Web as "from one product requirement to a reviewable prototype" and promises:

- PRD and product structure generation
- UI design generation
- visual asset generation
- HTML reconstruction
- visual QA and repair
- Figma delivery

The current public UI on `main` exposes these primary routes:

- `/`: workflow console
- `/make`: Make-style Agent workspace
- `/image-make`: single-image generation pipeline

This creates a product mismatch. The public story is an end-to-end design production line, while the UI starts from internal concepts: console, Make, single-image generation, Stage, Agent, asset-map, and handoff prompt.

Therefore, this plan supersedes any earlier interpretation that the work is mostly a layout cleanup. The core problem is product IA.

## Confirmed Decisions

- The product should be approachable for future external users, not only for local expert use.
- The default experience should be beginner-friendly.
- Advanced workflow details should remain available, but should not dominate the first-run experience.
- `/` should become a welcome/start page.
- `/image-make` should remain the stable route for now, but the UI should label it as the main generation studio, not as "single image generation".
- `/make` should be preserved as an advanced Agent Lab, not as a peer default path.
- `/dashboard` should become a project/status dashboard, not a primary generation surface.
- The product should introduce `Project`, `Run`, `Prototype`, and `Artifact` as first-class user-facing objects.
- The first implementation phase should only change frontend UI and page flow.
- The first implementation phase should not change model execution logic, backend APIs, or persistence behavior.

## Core Object Model

The product should stop making routes, Stage numbers, and Agent names the primary objects in the beginner experience.

### Project

The top-level user object. A project represents one product/page prototype effort.

Examples:

- "Seafood Delivery App Home"
- "B2B SaaS Dashboard"
- "AI note-taking onboarding page"

### Run

A single execution attempt inside a project. Runs can produce partial or complete artifacts.

Examples:

- "Design run"
- "Asset generation run"
- "HTML repair run"

### Prototype

The current user-visible output of a project. A prototype can include UI design, generated assets, HTML preview, review reports, and export packages.

### Artifact

Concrete output files or evidence.

Examples:

- `ui-design.png`
- generated assets
- `index.html`
- visual QA report
- Figma import package
- project JSON

### Stage

An internal workflow/debugging concept. It can remain visible in Agent Lab and advanced inspectors, but it should not be the first concept shown to new users.

## Current Problems

### 1. Public Promise And Product UI Do Not Match

The README promises a complete design-to-web production line. The current route labels and first screens communicate implementation surfaces instead:

- "控制台"
- "Make"
- "单图生成"
- "Execution Stages"
- "Agent Console"

A first-time user should not have to understand the internal architecture before generating a prototype.

### 2. The Product Lacks A Primary User Object

The UI currently organizes around Stage, Agent, documents, and routes. Users expect to organize around projects and outputs.

The missing object model causes three downstream problems:

- Recent work is hard to understand because it is history of runs, not projects.
- Dashboard feels like an operations console, not a project home.
- Export actions feel detached from a clear project outcome.

### 3. Three Routes Compete As Generation Entry Points

The current product exposes three generation-like surfaces:

- `/`: workflow console with Agent Console and Project Planner
- `/make`: Agent chat, route templates, canvas, and process viewer
- `/image-make`: direct design-to-assets-to-HTML pipeline

For a new user, all three can look like places to start. This is the highest-priority IA bug.

### 4. `/dashboard` Is Not A Dashboard Yet

The existing dashboard content is valuable, but it is not a beginner dashboard. It is closer to an internal workflow operations console:

- document library
- stage board
- Agent console
- project planner
- status mutation controls

It should not be the default landing page and should not remain the primary status page without being reframed around projects and runs.

### 5. `/image-make` Has The Right Capabilities But Still Has Multiple Mental Models

`/image-make` is the strongest candidate for the main studio because it already contains:

- prompt and reference image input
- UI design generation
- asset generation
- missing asset scan
- HTML generation
- dual-model review and repair
- export packages
- history persistence

However, the page still mixes these layers at nearly the same level:

- beginner input
- current step action
- independent rerun controls
- history restore
- export actions
- technical inspector
- review repair notes
- model and Agent details

The next redesign should not merely add a stepper. It should enforce a single current primary action per step.

### 6. `/make` Is An Agent Lab, Not A Default Make Experience

`/make` is useful for controlling stage selection, Agent type, route templates, batch settings, generated artifacts, and execution process. That makes it powerful for expert users.

It should be positioned as Agent Lab or Advanced Lab. It should not be a same-rank default navigation item for new users.

### 7. Expert Language Appears Too Early

Terms such as Stage, Agent, Gemini, image2, GPT-5.5, asset-map, handoff prompt, design-spec, SQLite, and visual QA are useful internally, but they should not be the first layer of product copy.

Beginner-facing copy should say:

- Describe page
- Generate design
- Generate assets
- Generate web page
- Review and repair
- Export project

### 8. Final Deliverables Are Not Prominent Enough

Before users type a prompt, they should understand what they will get:

- UI design image
- generated visual assets
- HTML preview
- review/repair report
- HTML and assets package
- Figma import package

This deliverable promise should be visible on the start page and the main studio hero.

## Target Information Architecture

### `/` Start Page

Purpose: help a first-time user understand what the tool does and choose the right next step.

Primary actions:

- Create a new prototype project.
- Continue a recent project.
- Configure model access if setup is incomplete.
- Open Agent Lab only as an advanced path.

The page must avoid exposing the full 0-10 stage workflow by default.

First-screen promise:

- "Describe a product or page. Get UI design, assets, HTML preview, review, and Figma delivery."

### `/dashboard` Projects Dashboard

Purpose: help returning users understand project status and resume work.

Default content:

- recent projects and runs
- each project's current step
- latest artifact preview or status
- failed or blocked runs
- export-ready projects

Non-goals:

- Do not make Agent Console a primary dashboard element.
- Do not ask new users to select a Stage before they have a project.
- Do not show implementation documents as the main dashboard object.

The existing StageBoard, DocumentLibrary, AgentConsole, and ProjectPlanner can remain as an internal operations view, but that view should be visually and semantically framed as advanced/internal.

### `/image-make` Main Generation Studio

Purpose: the default step-by-step product experience for creating a reviewable prototype.

Route stability:

- Keep `/image-make` for now to avoid breaking existing links and history.
- Label the page as "生成工作台", "Prototype Studio", or "Generation Studio" in UI.
- Avoid using "单图生成" as the product-level name because it undersells the workflow and conflicts with the README's end-to-end promise.

Target workflow:

1. Describe
2. Design
3. Assets
4. HTML
5. Review
6. Export

Expected layout direction:

- Top: project identity, output promise, model readiness, and stepper.
- Left or top input area: page requirement and reference image input.
- Center: primary preview of the current artifact.
- Right: deliverable/status summary by default.
- Advanced drawer or inspector: logs, prompts, model details, JSON, asset-map, review reports.

Only the current primary action should be visually dominant.

Step-level primary actions:

- Describe: "Generate UI design"
- Design: "Approve design" or "Regenerate design"
- Assets: "Generate assets"
- HTML: "Generate HTML preview"
- Review: "Review and repair"
- Export: "Export package"

Secondary controls such as missing-asset scan, rerun, repair notes, model details, and raw prompts must not compete with the current primary action.

### `/make` Agent Lab

Purpose: advanced Agent orchestration and workflow debugging.

Route stability:

- Keep `/make` for now.
- Label it as "Agent Lab" or "高级实验室", not as a default Make experience.

Keep:

- stage selection
- Agent selection
- route templates
- batch design/asset controls
- canvas preview
- handoff prompt
- run history

Change direction:

- Label clearly as Agent Lab or Advanced Lab.
- Reduce overlap with the beginner workflow.
- Keep technical details visible because this page is for expert users.

### Settings

Purpose: make model readiness explicit without turning the main workflow into a settings problem.

Settings should include:

- model provider presets
- API keys and local-storage explanation
- Agent-to-model binding
- browser-direct execution toggle
- setup status shown globally

## Implementation Scope

Allowed in the current frontend-first redesign:

- Frontend routing and navigation changes.
- New start page and dashboard framing.
- Layout restructuring for `/image-make`.
- UI copy changes that hide expert terminology from beginner flows.
- Inspector/drawer organization for advanced details.
- README and onboarding copy updates.
- CSS changes for layout, hierarchy, and responsive behavior.

Not allowed in this phase unless explicitly approved:

- Backend API changes.
- Model request protocol changes.
- Agent runtime behavior changes.
- Persistence schema changes.
- Large refactors of generation logic.
- Removing `/make`.

## Priority Roadmap

### P0: Product IA Reset

- [x] Create a working redesign plan.
- [x] Move `/` toward a welcome/start page in local redesign.
- [x] Move current dashboard UI to `/dashboard` in local redesign.
- [x] Label `/image-make` as "生成工作台" in local redesign.
- [x] Add a six-step workflow stepper to `/image-make` in local redesign.
- [x] Add inspector tabs for dense technical details in local redesign.
- [x] Update this plan so it reflects the repository audit and product IA reset.
- [ ] Align README onboarding with the intended default path.
- [ ] Make the UI introduce `Project`, `Run`, `Prototype`, and `Artifact` concepts.
- [ ] Make `/dashboard` a project/status dashboard rather than a generation console.
- [ ] Reframe `/make` as Agent Lab in navigation and page copy.
- [ ] Make `/image-make` enforce one dominant primary action per current step.
- [ ] Move rerun controls, repair notes, logs, prompts, model internals, JSON, and asset-map into Advanced.

Acceptance criteria:

- A new user can answer within five seconds: what this product creates, where to start, and what they will get.
- There is only one obvious default generation path.
- Dashboard, studio, and Agent Lab have distinct responsibilities.
- Expert details are available but not required for first success.

### P1: Project Dashboard And First-Run Confidence

- [ ] Add or simulate project cards on `/dashboard`.
- [ ] Show recent projects with current step and latest artifact status.
- [ ] Add model readiness status to the start page and studio.
- [ ] Replace default demo prompt with examples or prompt chips.
- [ ] Improve empty states so they explain the next action and expected output.
- [ ] Make export readiness clear before and after generation.
- [ ] Add first-run path in README with recommended route and expected output.

Acceptance criteria:

- Returning users can resume work without reading Stage history.
- First-time users can start without understanding Agent names.
- Users understand why export buttons are disabled before output exists.

### P2: Advanced Mode And Multi-Page Expansion

- [ ] Rename and visually frame `/make` as Agent Lab.
- [ ] Keep route templates, stage selection, Agent selection, batch controls, canvas, handoff prompt, and run history.
- [ ] Make Agent Lab explicitly useful for debugging, batch generation, and route experiments.
- [ ] Add a path from generated project outputs back into Agent Lab for advanced users.
- [ ] Explore future route migration from `/image-make` to `/studio/:projectId`.
- [ ] Explore multi-page project dashboard and batch generation UX.

Acceptance criteria:

- `/make` no longer competes with the main studio as a default path.
- Advanced users can still inspect and control Agent internals.
- Multi-page work has a clear project-level home.

## Resolved Product Decisions

- `/` is the default start page.
  - Reason: the public product promise is a creation workflow, not an operations console.
  - Backend impact: none expected.
- `/dashboard` is a project/status dashboard, not the main generation path.
  - Reason: returning users need to resume projects and inspect outputs; first-time users should not start from StageBoard.
  - Backend impact: project-level cards may initially be simulated from existing image-make history; a stronger project model may require later backend work.
- `/image-make` remains the stable route for the main studio.
  - Reason: the route already contains the strongest end-to-end pipeline and existing history/export behavior.
  - Product copy: use "生成工作台", "Prototype Studio", or "Generation Studio"; avoid "单图生成" as the product-level name.
  - Backend impact: none expected for the first pass.
- `/make` is Agent Lab.
  - Reason: it is valuable for stage selection, Agent selection, route templates, batch controls, and generated artifacts, but it is too technical for the default path.
  - Backend impact: none expected.
- Model settings remain globally accessible.
  - Reason: every path may depend on model readiness.
  - UX requirement: beginner-facing setup copy should explain that browser-stored API keys are local browser settings.
- README and UI onboarding must align.
  - Reason: GitHub is part of the product onboarding surface. The README should name the recommended first route and expected outputs.

## Expected Files To Modify

### Frontend App Shell

- `frontend/src/App.vue`
  - Keep route handling for `/`, `/dashboard`, `/image-make`, and `/make`.
  - Keep `/` as start page.
  - Keep `/image-make` and `/make` behavior intact while changing their product framing.
- `frontend/src/components/AppHeader.vue`
  - Update navigation labels and hierarchy.
  - Recommended primary navigation:
    - `开始` -> `/`
    - `生成工作台` -> `/image-make`
    - `项目` -> `/dashboard`
    - `Agent Lab` or `高级实验室` -> `/make`
  - Consider visually demoting Agent Lab relative to the main studio.
  - Keep model settings globally accessible.

### New Or Restructured Pages

- `frontend/src/pages/WelcomePage.vue`
  - Should communicate the product promise, expected outputs, model readiness, recent projects, and one primary CTA into the studio.
  - Should not expose Stage, Agent, asset-map, or handoff prompt in first-screen copy.
- `frontend/src/pages/DashboardPage.vue`
  - Should evolve from workflow console into project/status dashboard.
  - Should show project cards, current step, latest artifact status, failed runs, and export readiness.
  - Existing StageBoard, DocumentLibrary, AgentConsole, and ProjectPlanner should move behind an advanced/internal section if retained.

### Main Workspace

- `frontend/src/pages/ImageMakePage.vue`
  - Make the page feel like the primary studio, not a dense tool panel.
  - Ensure only one current primary action is dominant.
  - Move rerun controls, review notes, JSON, model details, raw prompts, asset-map, and logs into Advanced.
  - Show final deliverables before generation begins.
  - Replace the fixed demo prompt with examples or prompt chips.
  - Existing functions such as `generateDesign`, `generateAssets`, `scanAndGenerateMissingAssets`, `generateHtml`, and `reviewAndRepairHtml` should remain behaviorally unchanged.

### Advanced Workspace

- `frontend/src/pages/MakePage.vue`
  - Update labels and page framing to clarify that this is Agent Lab.
  - Add an advanced-mode explanation that does not read like marketing copy.
  - Existing Agent orchestration behavior should remain intact.

### Documentation

- `README.md`
  - Add recommended first-run route.
  - Add a concise product flow diagram or route responsibility table.
  - Explain that `/make` is Agent Lab and `/image-make` is the default studio.
  - Add expected outputs for the first successful run.
- `docs/ui-redesign-plan.md`
  - Keep this plan aligned with product decisions and implementation history.

### Shared Styles

- `frontend/src/styles.css`
  - Keep layout changes scoped with page-specific class prefixes.
  - Update `/image-make` layout, advanced drawer/inspector, stepper, empty states, and responsive behavior.
  - Update dashboard/project cards and Agent Lab framing.

## Possible Risks And Hidden Costs

- Project language may outgrow the current persistence model.
  - First pass can map existing image-make history into lightweight projects.
  - A later backend change may be needed for true multi-run/multi-page project state.
- Direct navigation to `/dashboard` may require SPA fallback support in production hosting.
  - Vite dev server usually handles this.
  - A static production host must fallback unknown frontend routes to `index.html`.
- Reframing `/dashboard` can accidentally break workflow debugging behavior.
  - Keep the old workflow console available under an advanced/internal section until replacement project cards are reliable.
- Recent projects may depend on both localStorage and backend history.
  - If the backend is not running, the welcome page should degrade gracefully.
  - It should not block the primary CTA.
- Model settings from the start page may require a small control API.
  - Avoid duplicating the settings drawer.
  - Reuse the existing global model settings panel.
- Renaming UI labels can confuse existing users if route names stay unchanged.
  - Keep the route stable.
  - Use clear labels and optional small helper text during the transition.
- `/image-make` is a large component with mixed orchestration and rendering logic.
  - Layout changes should be incremental.
  - Avoid rewriting model pipeline functions during UI restructuring.
- Moving advanced controls into drawers can hide legitimate expert workflows.
  - Provide clear Advanced access and preserve keyboard/mouse efficient controls.
- CSS changes may affect multiple pages because styles are global.
  - New styles should use scoped class prefixes where possible.
  - Existing shared button and panel styles should be reused conservatively.
- The browser-based model runtime stores settings in localStorage.
  - Welcome/setup UI should not imply that keys are stored on the server.
  - Copy should stay clear that model keys are local browser settings.

## Change Log

### 2026-06-08

- Reframed the plan from UI redesign to product IA redesign after auditing the public GitHub repo and README.
  - recorded the mismatch between the README's end-to-end design production promise and the current route labels on `main`
  - added the core object model: Project, Run, Prototype, Artifact, and Stage as an internal concept
  - redefined `/` as Start, `/dashboard` as Projects Dashboard, `/image-make` as the main Generation Studio, and `/make` as Agent Lab
  - moved dashboard de-generation, Agent Lab framing, README onboarding alignment, and single-primary-action studio behavior into P0
  - updated expected file impact and risks to include README, project cards, model readiness, and future project persistence

- Implemented Phase 3 `/image-make` inspector and advanced details:
  - added a right-side inspector with tabs for Status, Artifacts, Logs, Prompt, and Model details
  - moved dense HTML review, design-spec, code-review, visual-review, section-scan, missing-asset, prompt, and model/Agent details out of the default preview flow
  - kept beginner-facing current step, primary action, design preview, asset preview, HTML preview, history, reference upload, export actions, logs, and reports available
  - kept model settings centralized in the global header; the inspector only summarizes model/Agent stages and run IDs
  - preserved the existing behavior of `generateDesign`, `generateAssets`, `scanAndGenerateMissingAssets`, `generateHtml`, and `reviewAndRepairHtml`
- Phase 3 verification:
  - `npm run build` completed successfully in `frontend`.
  - Starting a new Vite dev server in the sandbox failed with `listen EPERM 127.0.0.1:5173`; escalation was requested, but the approval service returned `503 Service Unavailable`.
  - An existing local Vite server responded to `curl http://127.0.0.1:5173/image-make`, but the in-app browser refused to open `http://127.0.0.1:5173` because that local address is blocked by browser security policy, so visual browser QA could not be completed in Codex.

- Implemented Phase 2 `/image-make` main workspace flow:
  - added a six-step workflow stepper for Requirement, Design, Assets, HTML, Review, and Export
  - mapped existing prompt/design/assets/HTML/review/export state into the current step
  - promoted a single current-step primary action at the top of the workspace
  - demoted independent rerun, missing-asset, review-note, history, and export controls into detail areas
  - preserved existing design preview, reference image upload, asset grid, HTML preview, history, export, log/report, and review sections
- Kept the existing generation and review function bodies unchanged:
  - `generateDesign`
  - `generateAssets`
  - `scanAndGenerateMissingAssets`
  - `generateHtml`
  - `reviewAndRepairHtml`
- Phase 2 verification:
  - `npm run build` completed successfully in `frontend`.
  - The design, asset, HTML, review/repair, and export entry points remain wired to their existing functions.
  - Local browser verification of `/image-make` could not be completed in the sandbox because starting Vite failed with `listen EPERM 127.0.0.1:5173`; escalation was requested, but the approval service returned `503 Service Unavailable`.
  - Fixed an empty asset-grid layout issue where the "Assets" placeholder could visually overlap the following HTML card; the fix gives the empty state a stable grid row span.
  - `npm run build` completed successfully again after the overlap fix.

- Implemented Phase 1 frontend routing and welcome start page:
  - added `frontend/src/pages/WelcomePage.vue`
  - extracted the existing dashboard into `frontend/src/pages/DashboardPage.vue`
  - changed `/` to render the welcome page
  - moved the existing dashboard UI to `/dashboard`
  - kept `/image-make` and `/make` behavior intact
- Updated header navigation labels and destinations:
  - `开始` -> `/`
  - `生成工作台` -> `/image-make`
  - `控制台` -> `/dashboard`
  - `高级模式` -> `/make`
- Preserved the global model settings entry and added a welcome-page setup card that opens the existing model settings drawer.
- Added a compact recent-projects area on the welcome page using the existing `image-make` browser history key, with an empty fallback when no history is available.
- Verification:
  - `npm run build` completed successfully in `frontend`.
  - Local route/browser verification could not be completed because starting Vite was blocked by the sandbox with `listen EPERM` on both `0.0.0.0:5173` and `127.0.0.1:5174`; no backend, API, model runtime, or persistence logic was changed.
  - User verified `/`, `/dashboard`, `/image-make`, and `/make` locally at `http://localhost:5173/`.

### 2026-06-07

- Created initial UI redesign plan.
- Recorded confirmed direction:
  - beginner-friendly default experience
  - `/` as welcome/start page
  - `/image-make` as main workspace
  - `/make` as advanced Agent orchestration
  - first implementation phase limited to frontend UI and flow
- Resolved open product questions:
  - dashboard route should be `/dashboard`
  - `/image-make` should be labeled "生成工作台" in the UI
  - welcome page should show compact recent projects
  - model settings should remain global and also appear as a welcome-page setup card
- Added expected file impact and risk notes for the first redesign implementation.
