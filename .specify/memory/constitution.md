<!-- 
Sync Impact Report:
- Version change: N/A (initial creation) → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: Core Principles (5), Desktop Application Requirements, Development Workflow, Governance
- Removed sections: N/A
- Templates requiring updates: 
  ✅ .specify/templates/plan-template.md (Constitution Check section updated)
  ✅ .specify/templates/spec-template.md (scope alignment verified)
  ✅ .specify/templates/tasks-template.md (task categorization verified)
  ✅ .qwen/commands/constitution.toml (this command updated)
- Follow-up TODOs: None
-->

# Inspiration Source Tracker Constitution

## Core Principles

### I. Go-First Development
All backend services and desktop application components MUST be implemented in Go; The eino framework is the primary agent development platform; Code must follow Go idioms and best practices; Dependencies must be minimal and well-maintained; Performance and memory efficiency are critical requirements.

### II. Desktop-First User Experience
The primary user interface is a native Go desktop application; User interactions must be responsive and intuitive; Markdown editing capabilities must be robust and user-friendly; Citation tracking and summary features must be seamlessly integrated; Offline functionality is required for core features.

### III. Test-Driven Development (NON-NEGOTIABLE)
TDD is mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; All user-facing functionality must have corresponding integration tests; Contract tests required for all APIs and data interfaces; Code coverage must exceed 80% for core modules.

### IV. Markdown-Centric Data Model
All user content MUST be stored and processed as Markdown files; Citation metadata must be embedded using standardized Markdown extensions; Data persistence must prioritize human readability and version control compatibility; File-based storage is preferred over databases for user content; Backup and synchronization capabilities must be built-in.

### V. Inspiration Source Integrity
Citation summaries MUST accurately represent source material; Attribution tracking must be tamper-proof and verifiable; User privacy must be protected for personal inspiration sources; Data export capabilities must support multiple formats (Markdown, JSON, CSV); Source verification features should help users validate reference accuracy.

## Desktop Application Requirements

All desktop application features must adhere to native platform conventions (Windows, macOS, Linux); The application must support real-time Markdown preview; Citation management interface must allow easy addition, editing, and organization of sources; Search and filtering capabilities are required for managing large inspiration source collections; Export functionality must include formatted reports and raw data options.

## Development Workflow

Code reviews are mandatory for all pull requests; Static analysis and linting must pass before merge; Integration tests must pass on all supported platforms; Performance benchmarks must be established and monitored; Documentation must be updated alongside code changes; Breaking changes require version bump and migration path.

## Governance

This Constitution supersedes all other development practices and guidelines; All pull requests and code reviews MUST verify compliance with these principles; Amendments require documented justification, stakeholder approval, and a clear migration plan; Complexity must be justified against the simplicity principle; Use `.specify/memory/constitution.md` as the single source of truth for development guidance.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Initial project constitution creation date unknown | **Last Amended**: 2025-09-28