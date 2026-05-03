# Folder Structure Specification

## Purpose
This document defines the high-level structure of the Folder-as-Workspace paradigm, including the necessary folders and their purposes.

## High-Level Structure

### 1. /workspaces/general
- **Purpose**: Default area for unclassified reasoning or scratchpad thinking.
- **Usage**: Cognitive modeling, brainstorming, and structuring plans before executing them elsewhere.
- **Key Files**: `agi-prime-directive.md`, `brief.md`, `context.md`, `folder-structure-spec.md`, `key-components.md`, `spec.md`

### 2. /workspaces/writing
- **Purpose**: Used strictly for drafting textual output, notes, or blogging.
- **Usage**: Writing articles, blog posts, and other textual content.
- **Key Files**: `drafts/`, `notes/`, `blog-posts/`

### 3. /workspaces/production
- **Purpose**: Used strictly for executing technical actions, building components, and engineering software.
- **Usage**: Writing and testing code, building software components, and executing technical tasks.
- **Key Files**: `src/`, `tests/`, `build/`, `docs/`

## Constraints
1. Respect the designated environments. Only write technical code to production.
2. Use proper semantic filenames (e.g., `feature-spec.md` instead of `out.txt`).
3. Always check the local `context.md` inside your active folder before operating.
