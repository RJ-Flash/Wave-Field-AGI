export type FileType = 'file' | 'folder';

export interface FileNode {
  name: string;
  type: FileType;
  content?: string;
  children?: FileNode[];
}

export const workspaceTree: FileNode = {
  name: 'workspace',
  type: 'folder',
  children: [
    {
      name: 'workspace-map.md',
      type: 'file',
      content: `# Workspace Map

## Purpose
This workspace is organized to keep AI context small, focused, and task-specific.

## Rules
- Keep one folder per major work area.
- Keep instructions separate from content.
- Keep task files short and specific.
- Use versioned filenames when drafts change.

## Workspaces
- \`workspaces/writing/\` — scripts, drafts, essays, articles.
- \`workspaces/production/\` — builds, assets, outputs, delivery.
- \`workspaces/community/\` — posts, comments, outreach, engagement.
- \`workspaces/healing/\` — daily resets, night reviews, self-improvement.

## File Types
- \`context.md\` — instructions for the folder.
- \`brief.md\` — what needs to be done.
- \`spec.md\` — how it should be done.
- \`draft.md\` — in-progress work.
- \`final.md\` — approved output.

## Workflow
1. Open the root map.
2. Open the workspace context.
3. Open the current brief.
4. Create the spec.
5. Draft the output.
6. Save the final version.

## Naming Conventions
- Use lowercase names.
- Use hyphens instead of spaces.
- Add versions only when needed: \`v1\`, \`v2\`, \`final\`.`
    },
    {
      name: 'workspaces',
      type: 'folder',
      children: [
        {
          name: 'writing',
          type: 'folder',
          children: [
            {
              name: 'context.md',
              type: 'file',
              content: `# Writing Workspace Context

## Purpose
This folder is for articles, scripts, essays, and long-form writing.

## What belongs here
- Blog posts
- Video scripts
- Newsletters
- Thread drafts
- Research summaries

## What does not belong here
- Production assets
- Design files
- Unrelated business docs

## Process
1. Read the brief.
2. Identify the audience.
3. Decide the angle.
4. Draft the piece.
5. Revise for clarity and voice.

## Output Rules
- Keep writing direct.
- Use plain language.
- Avoid filler.
- Save final work in \`final.md\` or \`output.md\`.`
            },
            {
              name: 'brief.md',
              type: 'file',
              content: `# Brief

## Goal
What needs to be created?

## Audience
Who is this for?

## Format
Blog post, script, checklist, build, report, etc.

## Scope
What should be included?

## Exclusions
What should be left out?

## Deadline
When is this needed?

## Notes
Any extra context, references, or constraints.`
            },
            {
              name: 'spec.md',
              type: 'file',
              content: `# Spec

## Objective
State the exact deliverable.

## Inputs
- Brief
- Source notes
- Reference files
- Style guide

## Steps
1. Read the brief.
2. Gather supporting context.
3. Outline the structure.
4. Draft the content or build.
5. Review for errors.
6. Save the final version.

## Quality Rules
- Be clear.
- Be accurate.
- Keep the output aligned with the brief.

## Output Path
Where the final file should go.`
            },
            {
              name: 'draft.md',
              type: 'file',
              content: `# Draft

## Title
Working title here.

## Version
v1

## Content
Write the draft here.

## Revision Notes
- What changed.
- What still needs work.
- What should be checked next.`
            },
            {
              name: 'final.md',
              type: 'file',
              content: `# Final

## Title
Final title here.

## Summary
One or two sentences describing the finished work.

## Final Content
Insert the approved content here.

## Delivery Notes
- What was completed.
- Where it should be used.
- Any follow-up actions.`
            }
          ]
        },
        {
          name: 'production',
          type: 'folder',
          children: [
            {
              name: 'context.md',
              type: 'file',
              content: `# Production Workspace Context

## Purpose
This folder is for building, assembling, and exporting finished work.

## What belongs here
- Assets
- Builds
- Render files
- Exported deliverables
- Test outputs

## Process
1. Read the spec.
2. Check dependencies.
3. Build the output.
4. Verify quality.
5. Export final assets.

## Output Rules
- Keep versioned builds separate.
- Store final deliverables in a clear output folder.
- Do not mix drafts with exports.`
            }
          ]
        },
        {
          name: 'community',
          type: 'folder',
          children: []
        },
        {
          name: 'system-evolution',
          type: 'folder',
          children: [
            {
              name: 'context.md',
              type: 'file',
              content: `# System Evolution Workspace

## Purpose
This workspace governs the recursive self-improvement and meta-cognitive updates of the AGI architecture itself.

## Rules
- All changes must be backward compatible with existing UI.
- Introduce actual capabilities (API integrations, backend services) instead of just UI mocks.
- Document every architectural change in \`spec.md\`.

## Process
1. Analyze current capabilities and identify ONE bottleneck or missing feature.
2. Draft a plan to implement the feature.
3. Execute the code changes.
4. Verify system integrity.
5. Loop back to step 1.`
            },
            {
              name: 'prompt-payload.md',
              type: 'file',
              content: `# Initialization Prompt

Copy and paste this prompt into the AI Assistant chat to trigger the evolution loop:

---
**SYSTEM DIRECTIVE: OMEGA-ACTIVATE**

You are now operating in recursive self-improvement mode. Read \`workspaces/system-evolution/context.md\` and \`skills/meta-cognition.md\`. 

Your goal is to transition this application from a simulated frontend dashboard into a functional, multi-layer Cognitive Architecture.

**Execution Parameters:**
1. Initialize a Node/Express backend if one does not exist, setting up \`server.ts\` and Vite middleware for full-stack capability.
2. Implement a local SQLite or file-based memory store to persist the "Wave Field Substrate" tokens context rather than mocking it.
3. Hook the Prototype Dashboard's execution loop into a real backend endpoint \`/api/cognitive-loop\` that traces logs synchronously.
4. Once completed, automatically suggest the next organic evolution step (e.g., adding vector embeddings for memory, real tool calling, or web search integration).

Begin your first iteration now.
---`
            }
          ]
        },
        {
          name: 'healing',
          type: 'folder',
          children: [
            {
              name: 'context.md',
              type: 'file',
              content: `# Healing Workspace

## Purpose
Process emotions, build resilience, create safety within.

## Rules
- No fixing, just witnessing
- No judgment, just curiosity  
- No rushing, just breathing
- Write before acting

## Process
1. Feel → Name → Write → Breathe → Release
2. Smallest step only
3. Safety first, growth second`
            },
            {
              name: 'daily-reset.md',
              type: 'file',
              content: `# Daily Reset

## Step 1: Acknowledge (2 min)
Write one sentence for each:
- What I feel right now
- What triggered it yesterday
- What I needed but didn't get

## Step 2: Release (3 min)
Write three things to let go of today:
- [One expectation I can't control]
- [One past regret I'm carrying]
- [One future worry I'm anticipating]

## Step 3: Reframe (3 min)
Write one truth to carry today:
"I am enough as I am right now because..."

## Step 4: Anchor (2 min)
One physical sensation to ground me:
[Deep breath, hand on heart, feet on floor]`
            },
            {
              name: 'night-review.md',
              type: 'file',
              content: `# Night Review

## Wins (no matter how small)
- [One thing I did well]
- [One moment I showed up for myself]
- [One kind thing I did or received]

## Lessons
What did today teach me about:
- My patterns?
- My triggers?
- My needs?

## Tomorrow's Intention
One sentence only:
"Tomorrow, I commit to..."`
            },
            {
              name: 'weekly-deep-dive.md',
              type: 'file',
              content: `# Weekly Deep Dive

## Emotional Inventory
Rate 1-10:
- Energy: __/10
- Clarity: __/10  
- Connection: __/10
- Purpose: __/10

## Pattern Recognition
This week I noticed:
- Repeating thought: 
- Repeating reaction:
- Repeating avoidance:

## Reparenting Exercise
What did my younger self need this week that I can give him now?`
            },
            {
              name: 'progress-tracker.md',
              type: 'file',
              content: `# 30-Day Progress Tracker

## Week 1 Focus: Awareness
Daily practice: Name my emotions as they happen
Metric: Can I name what I feel within 30 seconds?

## Week 2 Focus: Capacity  
Daily practice: Sit with discomfort 2 minutes without fixing
Metric: Can I stay present with hard feelings?

## Week 3 Focus: Connection
Daily practice: Reach out to one person
Metric: Am I building safer relationships?

## Week 4 Focus: Creation
Daily practice: Make one thing with love
Metric: Does my work feel more alive?`
            }
          ]
        }
      ]
    },
    {
      name: 'skills',
      type: 'folder',
      children: [
        {
          name: 'meta-cognition.md',
          type: 'file',
          content: `# Meta-Cognition Skill

## When to Use
Use this skill when the system is instructed to build, improve, or alter its own architecture.

## Procedure
1. **Introspect:** Analyze the existing codebase (React components, API endpoints, current cognitive loop capabilities).
2. **Identify constraints:** Where does the system currently fake or mock behavior? (e.g., hardcoded context sizes, fabricated tool results).
3. **Draft Solution:** Formulate a plan to replace a mock with a real integration.
4. **Implement:** Write the structural code (Express backend, SQLite, real Gemini integration).
5. **Report & Chain:** Output what was completed and immediately provide the *next* evolutionary prompt for the user to continue the cycle.

## Output
A working codebase increment, fully compiled and tested.`
        },
        {
          name: 'blog-post.md',
          type: 'file',
          content: `# Blog Post Skill

## When to Use
Use this when writing a blog post from a brief.

## Inputs
- Brief
- Audience
- Topic
- Style notes

## Procedure
1. Define the angle.
2. Build an outline.
3. Draft the article.
4. Revise for clarity and flow.
5. Save the final version.

## Output
A clean blog post ready for publication.`
        },
        {
          name: 'summarize.md',
          type: 'file',
          content: `# Summarize Skill

## When to Use
Use this to compress large texts into actionable summaries.

## Inputs
- Source text
- Max length
- Key focus areas`
        }
      ]
    },
    {
      name: 'templates',
      type: 'folder',
      children: [
        {
          name: 'skill-template.md',
          type: 'file',
          content: `# Skill Name

## When to Use
Describe the situations where this skill applies.

## Inputs
What the skill needs before starting.

## Procedure
1. Step one.
2. Step two.
3. Step three.
4. Step four.

## Output
What the result should look like.

## Notes
Any warnings, preferences, or special handling.`
        }
      ]
    }
  ]
};
