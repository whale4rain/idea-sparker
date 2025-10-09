# Tasks: Inspiration Source Blog Writer

**Input**: Design documents from `/specs/001-build-an-application/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`, `src-tauri/`

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan in repository root
- [ ] T002 Initialize Go backend project with eino framework dependencies in backend/go.mod
- [ ] T003 [P] Initialize React frontend project with shadcn/ui components in frontend/package.json
- [ ] T004 [P] Initialize Tauri Rust project in src-tauri/Cargo.toml
- [ ] T005 [P] Configure Go linting (golangci-lint) in backend/.golangci.yml
- [ ] T006 [P] Configure ESLint and Prettier for React frontend in frontend/.eslintrc.json and frontend/.prettierrc

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Core Entity Tests
- [ ] T007 [P] Blog Draft model unit tests in backend/tests/unit/test_blog_draft.go
- [ ] T008 [P] Collected Resource model unit tests in backend/tests/unit/test_collected_resource.go
- [ ] T009 [P] Interest Idea model unit tests in backend/tests/unit/test_interest_idea.go
- [ ] T010 [P] Chat Session model unit tests in backend/tests/unit/test_chat_session.go

### Service Layer Tests
- [ ] T011 [P] Markdown editor service tests in backend/tests/integration/test_markdown_editor.go
- [ ] T012 [P] Link collection service tests in backend/tests/integration/test_link_collection.go
- [ ] T013 [P] AI agent analysis service tests in backend/tests/integration/test_ai_analysis.go
- [ ] T014 [P] Chat conversation service tests in backend/tests/integration/test_chat_service.go

### Frontend Component Tests
- [ ] T015 [P] Markdown editor component tests in frontend/tests/components/test_markdown_editor.test.tsx
- [ ] T016 [P] Link collection component tests in frontend/tests/components/test_link_collection.test.tsx
- [ ] T017 [P] IDEA ISPIRA button component tests in frontend/tests/components/test_idea_ispira_button.test.tsx
- [ ] T018 [P] Chat interface component tests in frontend/tests/components/test_chat_interface.test.tsx

### Integration Tests
- [ ] T019 [P] End-to-end blog writing and link collection test in tests/integration/test_blog_workflow.go
- [ ] T020 [P] End-to-end AI analysis and idea generation test in tests/integration/test_ai_workflow.go
- [ ] T021 [P] Offline functionality test for Markdown editing in tests/integration/test_offline_editing.go

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Backend Models (Go)
- [ ] T022 Blog Draft model implementation in backend/src/models/blog_draft.go
- [ ] T023 Collected Resource model implementation in backend/src/models/collected_resource.go
- [ ] T024 Interest Idea model implementation in backend/src/models/interest_idea.go
- [ ] T025 Chat Session model implementation in backend/src/models/chat_session.go

### Backend Services (Go)
- [ ] T026 Markdown editor service implementation in backend/src/services/markdown_editor.go
- [ ] T027 Link collection service implementation in backend/src/services/link_collection.go
- [ ] T028 AI agent analysis service implementation in backend/src/services/ai_analysis.go
- [ ] T029 Chat conversation service implementation in backend/src/services/chat_service.go

### Backend API (Go)
- [ ] T030 REST API endpoints for blog drafts in backend/src/api/blog_routes.go
- [ ] T031 REST API endpoints for collected resources in backend/src/api/resource_routes.go
- [ ] T032 REST API endpoints for AI analysis in backend/src/api/ai_routes.go
- [ ] T033 REST API endpoints for chat sessions in backend/src/api/chat_routes.go

### Frontend Components (React)
- [ ] T034 Markdown editor component in frontend/src/components/MarkdownEditor.tsx
- [ ] T035 Link collection component in frontend/src/components/LinkCollection.tsx
- [ ] T036 IDEA ISPIRA button component in frontend/src/components/IdeaIspiraButton.tsx
- [ ] T037 Chat interface component in frontend/src/components/ChatInterface.tsx

### Frontend Pages (React)
- [ ] T038 Main blog writing page in frontend/src/pages/BlogEditorPage.tsx
- [ ] T039 Resource management page in frontend/src/pages/ResourcePage.tsx
- [ ] T040 AI chat page in frontend/src/pages/AiChatPage.tsx

### Tauri Integration (Rust)
- [ ] T041 Tauri commands for file system operations in src-tauri/src/main.rs
- [ ] T042 Tauri configuration for window management in src-tauri/tauri.conf.json
- [ ] T043 Tauri plugin integration for system notifications in src-tauri/src/main.rs

## Phase 3.4: Integration
- [ ] T044 Connect frontend components to backend API services
- [ ] T045 Implement file-based storage for Markdown files and JSON metadata
- [ ] T046 Integrate eino AI agent with backend services
- [ ] T047 Configure CORS and security headers for backend API
- [ ] T048 Implement request/response logging for debugging
- [ ] T049 Set up offline capability with local storage synchronization

## Phase 3.5: Polish
- [ ] T050 [P] Comprehensive unit tests for all backend services in backend/tests/unit/
- [ ] T051 [P] Component tests for all React components in frontend/tests/components/
- [ ] T052 Performance optimization for AI response time (<500ms target)
- [ ] T053 Performance optimization for UI interactions (<100ms target)
- [ ] T054 [P] Export functionality implementation (Markdown, HTML, PDF)
- [ ] T055 [P] Update user documentation in docs/user-guide.md
- [ ] T056 Cross-platform testing on Windows, macOS, and Linux
- [ ] T057 Code cleanup and remove duplication
- [ ] T058 Run manual testing scenarios from quickstart validation

## Dependencies
- Setup tasks (T001-T006) before all other tasks
- Tests (T007-T021) before implementation (T022-T043)
- Backend models (T022-T025) before backend services (T026-T029)
- Backend services (T026-T029) before backend API (T030-T033)
- Frontend components (T034-T037) before frontend pages (T038-T040)
- Core implementation before integration (T044-T049)
- Everything before polish tasks (T050-T058)

## Parallel Example
```
# Launch model unit tests together:
Task: "Blog Draft model unit tests in backend/tests/unit/test_blog_draft.go"
Task: "Collected Resource model unit tests in backend/tests/unit/test_collected_resource.go"
Task: "Interest Idea model unit tests in backend/tests/unit/test_interest_idea.go"
Task: "Chat Session model unit tests in backend/tests/unit/test_chat_session.go"

# Launch frontend component tests together:
Task: "Markdown editor component tests in frontend/tests/components/test_markdown_editor.test.tsx"
Task: "Link collection component tests in frontend/tests/components/test_link_collection.test.tsx"
Task: "IDEA ISPIRA button component tests in frontend/tests/components/test_idea_ispira_button.test.tsx"
Task: "Chat interface component tests in frontend/tests/components/test_chat_interface.test.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Entities** (from spec.md):
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
2. **From User Stories** (from spec.md):
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

3. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Frontend → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All entities have model tasks (Blog Draft, Collected Resource, Interest Idea, Chat Session)
- [x] All user stories have corresponding integration tests
- [x] All tests come before implementation
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task