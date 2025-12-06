# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a new project using **BMAD Method v6** (Build More, Architect Dreams) - an AI-driven agile development framework. The project is in early setup phase with no application code yet.

## BMAD Framework

BMAD provides specialized AI agents and workflows for software development. The framework is installed in `.bmad/` with Claude Code slash commands in `.claude/commands/bmad/`.

### Using BMAD Agents

Invoke agents via slash commands:
- `/bmad/bmm/agents/analyst` - Initialize workflows, track progress
- `/bmad/bmm/agents/pm` - Create PRD and requirements
- `/bmad/bmm/agents/architect` - Design system architecture
- `/bmad/bmm/agents/sm` - Manage sprints, create stories
- `/bmad/bmm/agents/dev` - Implement code
- `/bmad/bmm/agents/ux-designer` - Create UX specifications

### Key Workflows

Run workflows by loading an agent and using `*workflow-name`:
- `*workflow-init` - Start a new project (Analyst)
- `*prd` - Create Product Requirements Document (PM)
- `*architecture` - Design system architecture (Architect)
- `*create-epics-and-stories` - Break down PRD into stories (PM)
- `*sprint-planning` - Initialize sprint tracking (SM)
- `*dev-story` - Implement a story (DEV)

### Development Phases

1. **Analysis** (Optional): Brainstorming, research, product brief
2. **Planning** (Required): PRD or tech-spec creation
3. **Solutioning** (Track-dependent): Architecture design
4. **Implementation** (Required): Epic-by-epic, story-by-story development

### Project Tracking Files

- `docs/bmm-workflow-status.yaml` - Phase progress tracking
- `docs/sprint-status.yaml` - Epic and story status during implementation

## Project Structure

```
.bmad/           # BMAD framework (do not edit)
  ├── core/      # Core framework + BMad Master agent
  ├── bmm/       # BMad Method (agents, workflows)
  ├── bmb/       # BMad Builder (create custom agents/workflows)
  └── cis/       # Creative Intelligence (brainstorming agents)
.claude/commands/bmad/  # Claude Code slash commands
app/             # Application code (empty - to be developed)
docs/            # Project documentation and stories
```
