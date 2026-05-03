# System Specification

## Enhanced Spec Overview
Your original spec.md outlines three key features for the AGI workspace system: file dependency visualization, a UI component explorer, and Deep Vector RAG for codebase queries. This enhanced version adds precise requirements, tech stack, implementation steps, folder structure, and validation criteria to enable rapid, robust builds within your Nexus platform's Markdown-based architecture.

## File Dependencies
**Requirements**: Parse Markdown files (e.g., spec.md referencing workspace-map.md) to build a directed graph showing imports/links (via [[links]], @mentions, or file paths). Support cycles detection, zoomable visualization, click-to-open files. Export SVG/PNG. Handle 1000+ files with <2s load.

**Tech Stack**: Node.js parser (unified.js for MD), Graphviz/D3.js for viz, Mermaid for static fallback.

**Implementation Steps**:
1. Scan /workspaces/ recursively for .md files.
2. Extract edges: regex for `[[file]]`, `![[file]]`, `@file`, `[text](file.md)`.
3. Generate DOT/Mermaid code; render via Dagre-D3 or Viz.js.
4. Add /api/dependencies endpoint returning JSON graph.
5. UI: Embed interactive SVG in new /dependencies page.

**Folder Additions**:
```
workspaces/system/
├── context.md  # "Tracks MD file relations via links/mentions"
├── spec.md     # Copy this enhanced spec
└── dependencies/
    ├── parser.js
    └── visualizer.html
```
Validate: Run on workspace-map.md; confirm 5+ edges shown.

## UI Component Explorer
**Requirements**: Sandboxed iframe/page showing Design System primitives (colors, typography, buttons, inputs). Controls for props (size/color variants), live preview, code snippet copy. Isolate from app state; support React/Next.js components. Auto-scan /components/ folder.

**Tech Stack**: Storybook.js (minimal setup), or custom with React Sandbox + Monaco Editor.

**Implementation Steps**:
1. Init Storybook: `npx storybook@latest init` in /design-system/.
2. Define stories: Button.stories.tsx with variants (primary/sm → large).
3. Embed iframe in /explorer page.
4. Add prop panels: knobs for color (#hex), size (sm/md/lg), theme toggle.
5. Persist examples as MD in /examples/.

**Folder Additions**:
```
design-system/
├── Button.stories.tsx  # variants: [{size: 'sm', color: 'blue'}]
├── Typography.stories.tsx
└── preview.js  # iframe src
workspaces/design/
├── context.md  # "Nexus UI primitives: Tailwind + shadcn"
└── brief.md    # "Live explorer for trader dashboard components"
```
Validate: Preview Button with 4 variants; copy React code.

## Deep Vector RAG Search
**Requirements**: NL queries ("find specs mentioning RAG") across all files/code. Hybrid search (text + code embeddings). UI endpoint /search with input, results list (snippet + file link + score), filter by folder/type. Upsert on file change. Local-only (Ollama + ChromaDB).

**Tech Stack**: LlamaIndex (indexing), sentence-transformers/all-MiniLM-L6-v2 (text), jina-embeddings-v2-base-code (code), Qdrant/Chroma for vectors, FastAPI endpoint.

**Implementation Steps**:
1. Chunk files: MD → sections (## headers), code → functions/classes via tree-sitter.
2. Embed: textify MD (humanize names + context), raw code snippets.
3. Store: Multi-vector collection (text:384dim, code:768dim); fuse RRF.
4. /api/search?q=query → top-10 hits w/ payload (file/line/snippet).
5. UI: Next.js page w/ input, results w/ highlight + open file.
6. Watch /workspaces/ for re-index (fs.watch).

**Folder Additions**:
```
workspaces/rag/
├── context.md  # "Semantic search over MD/codebase"
├── index.js    # LlamaIndex loader + embed
├── server.js   # QdrantClient upsert/query
└── ui.jsx      # Search form + results
```
Validate: Query "prop firm risk engine" → returns payout/trade files w/ scores >0.7.

## Integration & AGI Enhancements
**Unified Endpoint**: /api/workspace-tools {type: 'deps'|'explorer'|'rag', params}.
**Autonomy Boost**: Agent brief: "Read workspace-map.md + specs; implement via executor w/ restricted Node."
**Build Sequence**: 1. RAG (core memory). 2. Deps viz (self-awareness). 3. Explorer (UI polish). Test end-to-end: Agent queries RAG → builds component → viz deps.
**Metrics**: <5s query time, 90% recall on 10 test queries, zero crashes on 100-file workspace.
