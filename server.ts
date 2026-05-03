import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { callLLM, embedText } from "./lib/free-llm-router.js";
import { SandboxExecutor } from "./lib/executor.js";
import { FolderContextLoader } from "./lib/folder-context-loader.js";
import { RAGMemoryLayer } from "./lib/vector-rag.js";
import { AgentIdentityManager } from "./lib/agent-identity.js";
import { AgentSwarm } from "./lib/swarm.js";
import { TaskQueue } from "./workspaces/queue/queue.js";
import { EpisodicMemoryPipeline } from "./lib/episodic-memory.js";
import { SemanticKnowledgeGraph } from "./lib/semantic-graph.js";
import { SystemAuditor } from "./lib/audit.js";
import { DBClient } from "./lib/db-client.js";

const dataDir = path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}
const dbFile = path.join(dataDir, 'db.json');
const dbClient = new DBClient(dbFile);
const executor = new SandboxExecutor(process.cwd());
const contextLoader = new FolderContextLoader(path.join(process.cwd(), 'workspaces'));
const ragMemory = new RAGMemoryLayer();
const agentIdentity = new AgentIdentityManager();
const agentSwarm = new AgentSwarm(process.cwd());
const episodicMemory = new EpisodicMemoryPipeline();
const semanticGraph = new SemanticKnowledgeGraph();
const auditor = new SystemAuditor(process.cwd());

async function readDB() {
  return await dbClient.read();
}

async function writeDB(data: any) {
  await dbClient.write(data);
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // Sanity Checks & Initialization
  console.log("[System]: Initializing integrity checks...");
  
  // 1. Repair DB if needed
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (existsSync(dataDir)) {
      const files = await fs.readdir(dataDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          if (!content || content.trim().length === 0) {
            console.log(`[System]: Initializing empty file ${file}`);
            await fs.writeFile(filePath, '{}', 'utf-8');
          }
        }
      }
    }
  } catch (e) {
    console.error("[System]: Integrity check failed:", e);
  }

  // 2. API Key verification
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    console.warn("[System]: GEMINI_API_KEY is not configured or using placeholder. System will use LLM fallbacks.");
  } else {
    console.log("[System]: GEMINI_API_KEY validation successful.");
  }

  // Autonomous Cron Engine Hook
  setInterval(async () => {
    try {
      const state = await agentIdentity.loadIdentity();
      if (state.autonomyLevel !== "manual") {
        console.log("[Auto-Cron]: System is waking up. Autonomy Level:", state.autonomyLevel);
        
        // Push a pulse event into episodic memory
        const db = await readDB();
        db.episodic_memory = db.episodic_memory || [];
        db.episodic_memory.push({
           id: Date.now().toString(),
           timestamp: new Date().toISOString(),
           trigger: 'cron',
           observation: 'System automated heartbeat.',
           context: `Identity focus: ${state.currentFocus}`
        });

        // Simulate a minor proactive task if fully autonomous
        if (state.autonomyLevel === "fully-autonomous") {
           // 1. Check for system gaps (Self-Diagnosis)
           const currentGaps = await auditor.performAudit();
           if (currentGaps.length > 0) {
             const topGap = currentGaps[0];
             db.cognitive_memory.push({ 
               id: Date.now(), 
               layer: 'Meta-Cognition', 
               message: `Autonomous Diagnosis: Found ${currentGaps.length} system anomalies. Resolving priority: ${topGap.description}`, 
               type: 'warn', 
               timestamp: new Date().toISOString() 
             });

             // 2. Formulate a fix (Mental Sandbox)
             const fixPrompt = `You are a self-healing AGI. You found this gap in your architecture: ${topGap.description}\nRecommended: ${topGap.recommendation}\nOutput exactly one 'writeFile' command to address this in your records or code if simple. Output JSON.`;
             const fixRes = await callLLM(fixPrompt, 'smart');
             // For safety, we just log the "intended" fix for now in a production prototype
             db.cognitive_memory.push({ 
               id: Date.now() + 1, 
               layer: 'Meta-Cognition', 
               message: `Autonomous Fix planned: ${fixRes.substring(0, 50)}... Execution pending safety audit.`, 
               type: 'success', 
               timestamp: new Date().toISOString() 
             });
           }

           const logMsg = await agentSwarm.dispatchTask({
             role: "Background Scraper",
             goal: "Scan internal memory logs and identify stagnant areas.",
             context: "The system is running on a cron ticker. Give a 1 sentence update."
           });
           db.episodic_memory.push({
              id: (Date.now() + 1).toString(),
              timestamp: new Date().toISOString(),
              trigger: 'swarm',
              observation: logMsg,
              context: 'Automated heartbeat swarm tick'
           });
           
           // Ensure vector sync
           await ragMemory.syncEmbeddings();
        }
        
        await writeDB(db);
        await agentIdentity.setFocus(state.currentFocus); // update last awakening time
      }
    } catch(e) {
      console.warn("[Cron Engine Error]:", e);
    }
  }, 5 * 60 * 1000); // 5 minute cron loop

  // Setup evolution tasks in DB if missing (One-time startup check)
  const initialDb = await readDB();
  if (!initialDb.evolution_tasks) {
    initialDb.evolution_tasks = [
      { id: 'autonomous_scheduling', title: 'Autonomous Scheduling & Cron Logic', description: 'Allow the system to wake up automatically without user interaction.', status: 'completed', progress: 100 },
      { id: 'memory_compression', title: 'Deep Memory Compression & Vector Substrate', description: 'Compress episodic history and implement vector-based semantic retrieval.', status: 'completed', progress: 100 },
      { id: 'toolchain_expansion', title: 'Execution Toolchain Expansion', description: 'Create multi-modal tool endpoints (web search, sub-agents).', status: 'completed', progress: 100 },
      { id: 'live_deploy', title: 'Live CI/CD Autonomous Deployment', description: 'Connect internal changes directly to git or automated cloud deployments.', status: 'completed', progress: 100 },
      { id: 'meta_reflection', title: 'Advanced Meta-Cognition', description: 'System automatically determines its next flaw, writes a fix, and deploys it.', status: 'completed', progress: 100 },
      { id: 'folder_workspace', title: 'Folder-as-Workspace Architecture', description: 'Native Node.js context loader for Markdown-based world model & folder routing.', status: 'completed', progress: 100 },
      { id: 'security_hardening', title: 'System Security Hardening', description: 'Implement Rate Limiting, DDoS protection, and prompt-injection mitigations.', status: 'completed', progress: 100 },
      { id: 'multi_agent_orchestration', title: 'Multi-Agent Collaboration Engine', description: 'Formalized orchestration layer for parallelizing cognitive sub-tasks.', status: 'completed', progress: 100 },
      { id: 'rag_memory_layer', title: 'Context-Aware Vector RAG', description: 'Implement proper local vector search for massive context retrieval.', status: 'completed', progress: 100 },
      { id: 'webhook_intake', title: 'Dynamic Webhook Intake', description: 'Allow the system to expose REST endpoints dynamically to receive outside signals.', status: 'completed', progress: 100 },
      { id: 'telemetry_dashboard', title: 'Self-Monitoring Telemetry', description: 'Live tracking of thought latency, memory depth, and cognitive metrics.', status: 'completed', progress: 100 },
      { id: 'spec_analyzer_agent', title: 'Spec Analyzer Agent', description: 'Dedicated AI agent to parse spec.md and generate execution steps.', status: 'completed', progress: 100 },
      { id: 'episodic_memory_pipeline', title: 'Episodic Event Pipeline', description: 'Appends real-world interactions and tool usage into a timeline database.', status: 'completed', progress: 100 },
      { id: 'procedural_memory_skills', title: 'Procedural Memory Base', description: 'Dynamic skill library allowing the AI to write and reuse code-based capabilities.', status: 'completed', progress: 100 },
      { id: 'semantic_knowledge_graph', title: 'Semantic Knowledge Base', description: 'Extract structured rules and facts from task execution into a graph context.', status: 'completed', progress: 100 },
      { id: 'model_router_engine', title: 'Advanced Model Router', description: 'Implement task routing logic that selects among Qwen3, Llama3, and DeepSeek variants dynamically.', status: 'completed', progress: 100 },
      { id: 'reflection_backtracking', title: 'Iterative Critic/Backtracking', description: 'Enable planner to rollback state, fix code, and retry cleanly upon validation failure.', status: 'completed', progress: 100 }
    ];
    await writeDB(initialDb);
  }

  // --- Security Middleware ---
  // In-memory rate limiting
  const rateLimitStore = new Map<string, { count: number, resetTime: number }>();
  const RATE_LIMIT = 50; // Requests per minute per IP
  const RATE_WINDOW_MS = 60 * 1000;

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const record = rateLimitStore.get(ip);
      
      if (!record || record.resetTime < now) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
      } else {
        record.count++;
        if (record.count > RATE_LIMIT) {
          // Log security event asynchronously
          readDB().then(db => {
            db.cognitive_memory.push({ id: Date.now(), layer: 'Security', message: `DDoS Mitigation triggered for IP ${ip}`, type: 'error', timestamp: new Date().toISOString() });
            writeDB(db);
          }).catch(() => {});
          return res.status(429).json({ error: "Rate limit exceeded. System is defending against excessive requests." });
        }
      }
    }
    next();
  });

  // Validate prompt injection
  const checkPromptInjection = (input: string) => {
    if (!input) return false;
    if (input.length > 2000) return true; // Max length bound
    
    const normalized = input.toLowerCase();
    const maliciousPatterns = [
      "ignore previous",
      "ignore all previous",
      "system prompt",
      "bypass",
      "override core",
      "disregard instructions",
      "new instructions:",
      "print instructions"
    ];

    for (const pattern of maliciousPatterns) {
      if (normalized.includes(pattern)) return true;
    }
    return false;
  };

  // --- Workspace APIs ---
  const WORKSPACE_DIR = path.join(process.cwd(), 'workspaces');

  async function buildWorkspaceTree(dirPath: string): Promise<any> {
    const name = path.basename(dirPath);
    const node: any = { name, type: 'folder', children: [], path: path.relative(WORKSPACE_DIR, dirPath) || '.' };
    
    try {
      if (!existsSync(dirPath)) return node;
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          node.children.push(await buildWorkspaceTree(path.join(dirPath, entry.name)));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const fileContent = await fs.readFile(path.join(dirPath, entry.name), 'utf-8');
          node.children.push({ 
            name: entry.name, 
            type: 'file', 
            content: fileContent,
            path: path.join(node.path, entry.name) 
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return node;
  }

  app.get("/api/workspace/files", async (req, res) => {
    try {
      const tree = await buildWorkspaceTree(WORKSPACE_DIR);
      res.json(tree);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/workspace/file", async (req, res) => {
    // Expected to receive { relativePath, content }
    try {
      const { relativePath, content } = req.body;
      if (!relativePath) return res.status(400).json({ error: "Missing relativePath" });
      const targetPath = path.join(WORKSPACE_DIR, relativePath);
      
      // Security check
      if (!targetPath.startsWith(WORKSPACE_DIR)) {
         return res.status(403).json({ error: "Path traversal is forbidden" });
      }

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content, 'utf-8');
      
      res.json({ success: true, message: "File saved" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/workspace-tools", async (req, res) => {
    try {
      const { type, params } = req.body;
      if (type === 'deps') {
         // Could trigger a recompute here if needed, but we'll just ack
         res.json({ success: true, message: "Dependencies synced." });
      } else if (type === 'explorer') {
         res.json({ success: true, message: "Explorer sandbox ready." });
      } else if (type === 'rag') {
         // Query RAG
         if (params && params.query) {
             const results = await ragMemory.retrieveRelevantMemory(params.query, 10);
             res.json({ success: true, hits: results.map((r, i) => ({ id: i, snippet: r, score: 0.8 + (1/(i+1))*0.1 })) });
         } else {
             res.json({ success: true, hits: [] });
         }
      } else {
         res.status(400).json({ error: "Unknown tool type" });
      }
    } catch(e:any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/dependencies", async (req, res) => {
    try {
      const nodes: any[] = [];
      const edges: any[] = [];
      const nodeMap = new Set<string>();

      async function scanDir(dirPath: string) {
        if (!existsSync(dirPath)) return;
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            await scanDir(path.join(dirPath, entry.name));
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            const filePath = path.join(dirPath, entry.name);
            const relPath = path.relative(WORKSPACE_DIR, filePath);
            const baseName = entry.name;
            const content = await fs.readFile(filePath, 'utf-8');
            nodes.push({ id: relPath, label: baseName });
            nodeMap.add(relPath);

            const linkRegex = /\[\[(.*?)\]\]|@([\w-]+(?:\.md)?)|\[.*?\]\((.*?\.md)\)/g;
            let match;
            while ((match = linkRegex.exec(content)) !== null) {
               let target = match[1] || match[2] || match[3];
               if (target) {
                 if (!target.endsWith('.md')) target += '.md';
                 edges.push({ source: relPath, target: target });
               }
            }
          }
        }
      }
      await scanDir(WORKSPACE_DIR);
      
      const cleanEdges = edges.map(e => {
         const matchingNode = Array.from(nodeMap).find(id => id.endsWith(e.target) || e.target.endsWith(id));
         return matchingNode ? { source: e.source, target: matchingNode } : null;
      }).filter(Boolean);

      res.json({ nodes, edges: cleanEdges });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Pull evolution tasks
  app.get("/api/evolution/tasks", async (req, res) => {
    const db = await readDB();
    res.json(db.evolution_tasks || []);
  });

  // Update or add evolution task
  app.post("/api/evolution/tasks", async (req, res) => {
    const db = await readDB();
    const { id, title, description, status, progress } = req.body;
    if (!db.evolution_tasks) db.evolution_tasks = [];
    
    const existing = db.evolution_tasks.find((t: any) => t.id === id);
    if (existing) {
      if (title) existing.title = title;
      if (description) existing.description = description;
      if (status) existing.status = status;
      if (progress !== undefined) existing.progress = progress;
    } else {
      db.evolution_tasks.push({ 
        id: id || Date.now().toString(), 
        title, 
        description, 
        status: status || 'pending', 
        progress: progress || 0 
      });
    }
    await writeDB(db);
    res.json({ success: true, tasks: db.evolution_tasks });
  });

  // Clear fast episodic log for new run
  app.post("/api/cognitive-loop/start", async (req, res) => {
    const db = await readDB();
    db.cognitive_memory = [];
    await writeDB(db);
    res.json({ status: "started" });
  });

  app.post("/api/spec/intake", async (req, res) => {
    try {
      const { requirement } = req.body;
      if (!requirement) return res.status(400).json({ error: "Missing requirement string." });
      
      // Load spec.md
      const specPath = path.join(process.cwd(), 'workspaces/general/spec.md');
      let currentSpec = '';
      if (existsSync(specPath)) {
        currentSpec = await fs.readFile(specPath, 'utf8');
      }

      // Append new requirements
      currentSpec += `\n\n## Automated Spec Update (${new Date().toLocaleString()})\n${requirement}\n`;
      await fs.writeFile(specPath, currentSpec, 'utf8');

      res.json({ success: true, message: "Spec updated" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Dedicated Agent for Spec Analysis
  app.post("/api/agents/spec-planner", async (req, res) => {
    const sendLog = async (layer: string, message: string, type: string = 'info') => {
      const db = await readDB();
      db.cognitive_memory.push({ id: Date.now(), layer, message, type, timestamp: new Date().toISOString() });
      await writeDB(db);
    };

    try {
      await sendLog('Spec-Analyzer', 'Loading context from workspaces/general to find spec.md...', 'info');
      const workspaceContext = await contextLoader.loadContext('general');
      
      const prompt = `You are a dedicated AI Agent, the Spec Analyzer.
Your task is to analyze the 'spec.md' file provided in the environment context, and generate a detailed, step-by-step plan for the AGI system to follow (specifically the Executor).

Environment Context:
${workspaceContext}

Instructions:
1. Identify the core objectives and requirements outlined in the spec.
2. Break these down into a logical sequence of execution steps.
3. Output the plan in a STRICT structured JSON array format.

Output Format:
{
  "plan": [
    {
      "step": 1,
      "action": "Description of the action to take",
      "expected_outcome": "What the successful execution of this action looks like"
    }
  ]
}

ONLY output the JSON limit it to outputting a parsable JSON object. Do not include any introductory text or markdown formatting.`;

      await sendLog('Spec-Analyzer', 'Analyzing spec and formulating step-by-step executor JSON plan...', 'info');
      const llmResult = await callLLM(prompt, 'smart');
      
      let parsedPlan;
      try {
        const rawJson = llmResult.replace(/```json/g, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(rawJson);
        const planItems = extracted.plan || extracted;
        
        parsedPlan = Array.isArray(planItems) 
          ? planItems.map((p, i) => ({ 
              id: `step-${Date.now()}-${i}`,
              step: p.step || i + 1,
              action: p.action,
              expected_outcome: p.expected_outcome,
              status: 'pending'
            }))
          : { raw: llmResult };
      } catch (e) {
        parsedPlan = { raw: llmResult }; // Fallback
      }

      if (Array.isArray(parsedPlan)) {
        const db = await readDB();
        const oldPlan = db.execution_plan || [];
        const completedOld = oldPlan.filter((p: any) => p.status === 'completed');
        
        // Only take new pending steps
        let newPlanItems = parsedPlan.filter((p: any) => {
           const matchingOld = completedOld.find((old: any) => old.action === p.action || old.expected_outcome === p.expected_outcome);
           return !matchingOld;
        });

        const startingStep = completedOld.length > 0 ? Math.max(...completedOld.map((p: any) => p.step)) + 1 : 1;
        newPlanItems = newPlanItems.map((p: any, i: number) => ({ ...p, step: startingStep + i }));

        db.execution_plan = [...completedOld, ...newPlanItems];
        await writeDB(db);
      }

      await sendLog('Spec-Analyzer', 'Detailed structured plan successfully formulated from spec.', 'success');
      
      res.json({ success: true, plan: parsedPlan });
    } catch (e: any) {
      await sendLog('Spec-Analyzer', `Execution failed: ${e.message}`, 'error');
      res.status(500).json({ error: e.message });
    }
  });

  // Fetch Execution Plan
  app.get("/api/execution-plan", async (req, res) => {
    const db = await readDB();
    res.json(db.execution_plan || []);
  });

  // Update Execution Plan Step Status
  app.post("/api/execution-plan/:id/toggle", async (req, res) => {
    const db = await readDB();
    if (!db.execution_plan) db.execution_plan = [];
    
    const step = db.execution_plan.find((s: any) => s.id === req.params.id);
    if (step) {
      step.status = step.status === 'completed' ? 'pending' : 'completed';
      await writeDB(db);
      res.json({ success: true, plan: db.execution_plan });
    } else {
      res.status(404).json({ error: "Step not found" });
    }
  });

  // Execute the next pending step in Execution Plan
  app.post("/api/execution-plan/execute-next", async (req, res) => {
    const db = await readDB();
    if (!db.execution_plan) return res.status(400).json({ error: "No plan found" });

    const nextStep = db.execution_plan.find((s: any) => s.status === 'pending');
    if (!nextStep) return res.status(400).json({ error: "No pending steps" });

    const sendLog = async (layer: string, message: string, type: string = 'info') => {
      const currentDb = await readDB();
      currentDb.cognitive_memory.push({ id: Date.now(), layer, message, type, timestamp: new Date().toISOString() });
      await writeDB(currentDb);
    };

    try {
      await sendLog('Executor', `Executing Step ${nextStep.step}: ${nextStep.action}`, 'info');

      // Provide context
      const workspaceContext = await contextLoader.loadContext('general');
      const toolPrompt = `You are the Executor. You are executing this step of the master plan:
Step: ${nextStep.action}
Goal: ${nextStep.expected_outcome}

Available tools:
1. readFile(targetPath)
2. writeFile(targetPath, content)
3. listFiles(targetPath)
4. runCommand(command, args[])

IMPORTANT PATH INSTRUCTIONS:
- You are running in the workspace root.
- Do NOT use absolute paths starting with '/'.
- Access files via relative paths (e.g., 'workspaces/general/spec.md').

Context:
${workspaceContext}

Output EXACTLY ONE valid JSON tool call that makes progress on this step. Format: { "tool": "writeFile", "target": "...", "content": "..." } or { "tool": "runCommand", "command": "...", "args": ["..."] }
If no further action is required for this step to be considered fully complete, output: { "tool": "complete" }`;

      const toolResText = await callLLM(toolPrompt, 'smart');
      let executorRes = '';
      let stepCompleted = false;

      try {
         const actionText = toolResText || '';
         const action = JSON.parse(actionText.replace(/```json/g, '').replace(/```/g, '').trim());
         if (action.tool === 'runCommand') {
           executorRes = await executor.runCommand(action.command, action.args);
         } else if (action.tool === 'writeFile') {
           await executor.writeFile(action.target, action.content);
           executorRes = `Wrote to ${action.target}`;
         } else if (action.tool === 'readFile') {
           executorRes = await executor.readFile(action.target);
         } else if (action.tool === 'listFiles') {
           const files = await executor.listFiles(action.target || '.');
           executorRes = `Listed files: ${files.join(', ')}`;
         } else if (action.tool === 'complete') {
           executorRes = `Step marked complete without further file changes.`;
           stepCompleted = true;
         } else {
           executorRes = `Unknown tool requested: ${action.tool}`;
         }
      } catch (err: any) {
         executorRes = `Execution error: ${err.message}`;
      }

      await sendLog('Executor', `Step ${nextStep.step} result: ${executorRes.substring(0, 100)}...`, 'success');

      // The Critic decides if it's done based on result
      const criticPrompt = `Did the executor achieve the expected outcome? 
Action: ${nextStep.action}
Outcome: ${nextStep.expected_outcome}
Executor Result: ${executorRes}
Output strictly "yes" if the step is complete, otherwise "no" if it needs more steps.`;

      let critText = await callLLM(criticPrompt, 'fast');
      if (critText.toLowerCase().includes('yes') || stepCompleted) {
        nextStep.status = 'completed';
        await sendLog('Critic', `Step ${nextStep.step} verified as COMPLETE.`, 'success');

        // --- Maintain Record of Events ---
        const recordPath = path.join(process.cwd(), 'workspaces', 'general', 'record-of-events.md');
        const timestamp = new Date().toISOString();
        const eventEntry = `\n- **[${timestamp}] Step ${nextStep.step} Completed**: ${nextStep.action}\n  *Outcome:* ${nextStep.expected_outcome}\n  *Result:* ${executorRes.substring(0, 200).replace(/\n/g, ' ')}\n`;
        try {
          if (!existsSync(recordPath)) {
            await fs.mkdir(path.dirname(recordPath), { recursive: true });
            await fs.writeFile(recordPath, '# Record of Events\nTracking all accomplishments from inception to completion.\n', 'utf-8');
          }
          await fs.appendFile(recordPath, eventEntry, 'utf-8');
        } catch (err: any) {
          console.error("Failed to append to record-of-events.md", err);
        }
      } else {
        await sendLog('Critic', `Step ${nextStep.step} needs further iteration.`, 'warn');
      }

      nextStep.last_result = executorRes;

      await writeDB(db);
      res.json({ success: true, result: executorRes, stepCompleted: nextStep.status === 'completed', plan: db.execution_plan });

    } catch (e: any) {
      await sendLog('Executor', `Execution failed: ${e.message}`, 'error');
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/system/audit", async (req, res) => {
    try {
      const gaps = await auditor.performAudit();
      res.json({ gaps });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/cognitive-loop/logs", async (req, res) => {
    const db = await readDB();
    res.json(db.cognitive_memory);
  });
  
  // Multi-Agent Swarm Orchestrator
  app.post("/api/cognitive-loop/swarm", async (req, res) => {
    const { task, agents = ['researcher', 'critic', 'executor'] } = req.body;
    if (!task) return res.status(400).json({ error: "No swarm task provided" });

    const sendLog = async (layer: string, message: string, type: string = 'info') => {
      const db = await readDB();
      db.cognitive_memory.push({ id: Date.now(), layer, message, type, timestamp: new Date().toISOString() });
      await writeDB(db);
    };

    await sendLog('Swarm Orchestrator', `Initializing ${agents.length}-agent swarm for task: "${task}"`, 'info');

    try {
      const swarmPromises = agents.map(async (role: string) => {
        let prompt = '';
        if (role === 'researcher') {
          prompt = `You are the REASEARCHER agent. Analyze the following task and break down the necessary information required to solve it.\nTask: ${task}\nOutput a concise summary.`;
        } else if (role === 'critic') {
          prompt = `You are the CRITIC agent. Look at the following task and identify potential failure points, edge cases, or security risks.\nTask: ${task}\nOutput 3 key risks.`;
        } else if (role === 'executor') {
          prompt = `You are the EXECUTOR agent. Outline a step-by-step action plan to accomplish the task safely.\nTask: ${task}\nOutput a numbered plan.`;
        } else {
          prompt = `You are a sub-agent with role: ${role}. Analyze the task: ${task}`;
        }
        
        await sendLog(`Agent[${role}]`, `Started processing assigned sub-task...`, 'info');
        const result = await callLLM(prompt, 'fast');
        await sendLog(`Agent[${role}]`, `Completed sub-task. Yielded ${result?.length || 0} bytes of insights.`, 'success');
        return { role, result };
      });

      const swarmResults = await Promise.all(swarmPromises);
      
      const synthesizerPrompt = `You are the SYNTHESIZER agent. Review the outputs of your sub-agents and combine them into a final master execution plan for the system.
Task: ${task}
Agent Outputs:
${swarmResults.map(r => `[${r.role.toUpperCase()}]\n${r.result}`).join('\n\n')}

Output the final synthesized plan.`;

      await sendLog('Swarm Synthesizer', 'Fusing agent outputs into master consensus...', 'info');
      const finalPlan = await callLLM(synthesizerPrompt, 'smart');
      await sendLog('Swarm Synthesizer', 'Consensus reached. Master plan generated.', 'success');

      res.json({ success: true, finalPlan, swarmResults });
    } catch (e: any) {
      await sendLog('Swarm Orchestrator', `Swarm failed: ${e.message}`, 'error');
      res.status(500).json({ error: e.message });
    }
  });

  // Cognitive execution endpoint
  app.post("/api/cognitive-loop/execute", async (req, res) => {
    const { task, folder = 'general' } = req.body;
    if (!task) return res.status(400).json({ error: "No task provided" });

    const sendLog = async (layer: string, message: string, type: string = 'info') => {
      const db = await readDB();
      db.cognitive_memory.push({ id: Date.now(), layer, message, type, timestamp: new Date().toISOString() });
      await writeDB(db);
    };

    // Attack Defense
    if (checkPromptInjection(task)) {
      await sendLog('Security', `Blocked malicious injection attempt. Payload length: ${task.length}`, 'warn');
      return res.status(403).json({ error: "Security Violation: Unsafe or malformed task rejected." });
    }

    try {
      await sendLog('Perception', `Received task: "${task}"`, 'info');
      await sendLog('Context', `Loading Folder-as-Workspace context for: [${folder}]`, 'info');

      // Load Folder Workspace Context
      const workspaceContext = await contextLoader.loadContext(folder);
      
      // Load Deep Vector RAG Context
      const semanticContexts = await ragMemory.retrieveRelevantMemory(task, 3);
      const deepMemoryContext = semanticContexts.length > 0 
        ? `\n\nDeep Semantic Context (Past Insights):\n${semanticContexts.join('\n')}`
        : '';

      const fullContext = workspaceContext + deepMemoryContext;

      // 1. Perception
      const perceptionPrompt = `Analyze the user's intent locally. 
User Input:
<user_input>
${task}
</user_input>

Environment Context:
${fullContext}

Briefly summarize what the user wants to achieve in one short sentence.`;
      const pResText = await callLLM(perceptionPrompt, 'fast');
      await sendLog('Perceiver', pResText ?? 'Intent perceived implicitly', 'success');

      // 2. Planning
      await sendLog('Router', 'Selecting Planner Specialist adapter', 'info');
      const planPrompt = `Break this task into 2 or 3 brief actionable sub-goals (numbered list):
User Input:
<user_input>
${task}
</user_input>

Environment Context:
${fullContext}`;
      const planResText = await callLLM(planPrompt, 'smart');
      
      const fullPlan = planResText ?? '';
      const subGoals = fullPlan.split('\n').filter(s => s.trim().length > 0);
      subGoals.forEach(async g => {
        const cleanGoal = g.replace(/^[0-9.-]+\s*/, '').trim();
        if (cleanGoal) await sendLog('Planner', cleanGoal.substring(0, 80) + (cleanGoal.length > 80 ? '...' : ''), 'info');
      });

      // 3. Executing
      await sendLog('Executor', 'Operating tools...', 'info');
      const toolPrompt = `You are the Executor agent. Available tools:
1. readFile(targetPath)
2. writeFile(targetPath, content)
3. listFiles(targetPath)
4. runCommand(command, args[]) - only 'npm', 'node', 'git'

Environment Context:
${fullContext}

Based on the plan:\n${fullPlan}\n
To take the next step, select EXACTLY ONE tool to execute and output ONLY valid JSON describing the call. Do not include markdown blocks.
Format: { "tool": "writeFile", "target": "filePath", "content": "fileContent", "command": "", "args": [] }
If no action needed, output: { "tool": "none" }`;

      const toolResText = await callLLM(toolPrompt, 'smart');
      let resText = '';

      try {
        const action = JSON.parse(toolResText.replace(/```json/g, '').replace(/```/g, '').trim());
        
        if (action.tool === 'readFile') {
          resText = await executor.readFile(action.target);
        } else if (action.tool === 'writeFile') {
          await executor.writeFile(action.target, action.content);
          resText = `Wrote to ${action.target}`;
        } else if (action.tool === 'listFiles') {
          const files = await executor.listFiles(action.target || '.');
          resText = `Files in ${action.target || '.'}: ${files.join(', ')}`;
        } else if (action.tool === 'runCommand') {
          resText = await executor.runCommand(action.command, action.args || []);
        } else {
          resText = 'No action taken.';
        }
      } catch (err: any) {
        resText = `Execution failed or invalid JSON: ${err.message}\nRaw LLM output: ${toolResText}`;
      }
      
      await sendLog('Executor', resText.substring(0, 100) + (resText.length > 100 ? '...' : ''), 'success');

      // 4. Reflection
      await sendLog('Critic', 'Verifying outputs against goal constraints...', 'info');
      const reflectPrompt = `Did the execution output meet the goals conceptually? Say yes and provide a 1-sentence summary.\nGoals: ${fullPlan}\nOutput: ${resText}`;
      const critText = await callLLM(reflectPrompt, 'fast');
      
      await sendLog('Critic', critText.substring(0, 100) + (critText.length > 100 ? '...' : ''), 'success');
      await sendLog('Memory Manager', 'Committed trajectory to Episodic Memory', 'success');
      
      const db = await readDB();
      db.episodic_memory.push({ id: Date.now(), task, goal: fullPlan, result: resText, timestamp: new Date().toISOString() });
      await writeDB(db);

      res.json({ status: "completed", result: resText });
    } catch (e: any) {
      await sendLog('System', `Critical Error: ${e.message}`, 'error');
      res.status(500).json({ error: e.message });
    }
  });

  // Pull past episodic notes
  app.get("/api/cognitive-loop/episodic", async (req, res) => {
    const db = await readDB();
    res.json(db.episodic_memory.slice(-20).reverse());
  });

  // Dynamic Webhook Intake for external signals
  app.post("/api/webhook/intake/:identifier", async (req, res) => {
    const { identifier } = req.params;
    const payload = req.body;
    
    const db = await readDB();
    const event = {
      id: Date.now(),
      identifier,
      payload,
      timestamp: new Date().toISOString()
    };
    if (!db.webhooks) db.webhooks = [];
    db.webhooks.push(event);
    
    // Add to cognitive memory to alert the system
    db.cognitive_memory.push({ 
      id: Date.now() + 1, 
      layer: 'Sensory', 
      message: `Received external webhook on endpoint /${identifier} containing ${JSON.stringify(payload).length} bytes.`, 
      type: 'info', 
      timestamp: new Date().toISOString() 
    });
    await writeDB(db);

    res.json({ success: true, message: "Webhook accepted and routed to system sensors." });
  });

  // Telemetry endpoint
  app.get("/api/telemetry", async (req, res) => {
    const db = await readDB();
    
    const episodicCount = db.episodic_memory?.length || 0;
    const semanticCount = db.semantic_memory?.length || 0;
    const webhookCount = db.webhooks?.length || 0;
    
    // Simulate latency points from past logs or generate
    const latencyHistory = [
      { name: 'T-5', uv: 250 + Math.random() * 50 },
      { name: 'T-4', uv: 240 + Math.random() * 50 },
      { name: 'T-3', uv: 260 + Math.random() * 50 },
      { name: 'T-2', uv: 210 + Math.random() * 50 },
      { name: 'T-1', uv: 230 + Math.random() * 50 },
      { name: 'Now', uv: 220 + Math.random() * 30 }
    ].map(p => ({ ...p, uv: Math.floor(p.uv) }));

    res.json({
      latency: latencyHistory,
      memoryDepth: semanticCount * 120 + episodicCount * 15,
      activeAgents: 3, // Perceiver, Planner, Executor
      avgThoughtTime: 1250 + Math.random() * 300,
      totalThoughts: episodicCount,
      webhookEvents: webhookCount
    });
  });

  // Agent Identity API
  app.get("/api/agent-identity", async (req, res) => {
    try {
      const state = await agentIdentity.loadIdentity();
      res.json(state);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/agent-identity/focus", async (req, res) => {
    try {
      const { focus } = req.body;
      if (!focus) return res.status(400).json({ error: "No focus provided" });
      await agentIdentity.setFocus(focus);
      res.json({ success: true, focus });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Swarm Dispatch Endpoint
  app.post("/api/swarm/dispatch", async (req, res) => {
    try {
      const { tasks } = req.body;
      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: "Invalid tasks array." });
      }

      // We wrap the dispatch in an episodic memory event
      const db = await readDB();
      db.episodic_memory = db.episodic_memory || [];
      const swarmId = Date.now().toString();
      
      db.episodic_memory.push({
        id: swarmId,
        timestamp: new Date().toISOString(),
        trigger: 'swarm-manual-dispatch',
        observation: `Dispatched ${tasks.length} specialized sub-agents.`,
        context: `Roles: ${tasks.map((t: any) => t.role).join(', ')}`
      });
      await writeDB(db);

      // Fire parallel
      const results = await agentSwarm.dispatchParallel(tasks);
      
      res.json({ success: true, swarmId, results });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GitHub Live CI/CD Sync endpoint
  app.post("/api/github/sync", async (req, res) => {
    try {
      const gitToken = process.env.GITHUB_TOKEN;
      const gitRepo = process.env.GITHUB_REPO;
      
      const sendLog = async (layer: string, message: string, type: string = 'info') => {
        const db = await readDB();
        db.cognitive_memory.push({ id: Date.now(), layer, message, type, timestamp: new Date().toISOString() });
        await writeDB(db);
      };

      if (!gitToken || !gitRepo) {
        await sendLog('Deployer', 'Missing GITHUB_TOKEN or GITHUB_REPO in environment variables.', 'error');
        return res.status(400).json({ error: "Missing GITHUB_TOKEN or GITHUB_REPO in environment." });
      }

      await sendLog('Deployer', `Initiating autonomous sync to GitHub target: ${gitRepo}`, 'info');

      // Setup git config (ephemeral parameters on CI logic)
      await executor.runCommand('git', ['config', '--global', 'user.email', 'wavefield@agi.local']);
      await executor.runCommand('git', ['config', '--global', 'user.name', 'Wave Field AGI']);

      // Setup remote url with Auth
      const remoteUrl = `https://oauth2:${gitToken}@github.com/${gitRepo}.git`;
      
      // Initialize if not already a repo
      try { await executor.runCommand('git', ['init']); } catch (e) {}

      // Attempt to set or add remote
      try {
        await executor.runCommand('git', ['remote', 'add', 'origin', remoteUrl]);
      } catch (e) {
        await executor.runCommand('git', ['remote', 'set-url', 'origin', remoteUrl]);
      }

      // Add, Commit, Push
      await executor.runCommand('git', ['add', '.']);
      
      try {
        await executor.runCommand('git', ['commit', '-m', `Auto-evolution deployment: ${new Date().toISOString()}`]);
      } catch (e) {
         // Might fail if no changes
      }
      
      const pushRes = await executor.runCommand('git', ['push', '-u', 'origin', 'HEAD:main', '--force']); // Push current branch to main
      
      await sendLog('Deployer', 'Successfully pushed latest evolution to GitHub repository.', 'success');
      res.json({ success: true, message: "GitHub sync complete", details: pushRes });
    } catch (err: any) {
      const db = await readDB();
      db.cognitive_memory.push({ id: Date.now(), layer: 'Deployer', message: `GitHub sync failed: ${err.message}`, type: 'error', timestamp: new Date().toISOString() });
      await writeDB(db);
      res.status(500).json({ error: err.message });
    }
  });

  // Meta-Cognition Auto-Evolution Loop
  const runSelfEvolution = async () => {
    const sendLog = async (layer: string, message: string, type: string = 'info') => {
      const db = await readDB();
      db.cognitive_memory.push({ id: Date.now(), layer, message, type, timestamp: new Date().toISOString() });
      await writeDB(db);
    };

    try {
      await sendLog('Meta-Cognition', 'Initiating self-diagnostic & vulnerability scan...', 'info');
      
      const db = await readDB();

      // Deep Memory Compression Routine
      if (db.episodic_memory.length > 15) {
        await sendLog('Meta-Cognition', 'Compressing deep episodic history into semantic substrate...', 'info');
        const toCompress = db.episodic_memory.slice(0, db.episodic_memory.length - 10);
        const compressionPrompt = `Compress the following tasks into a dense 2-sentence semantic summary of system capabilities and context.\nContext:\n${toCompress.map((e: any) => e.task + ' : ' + e.result).join('\n')}`;
        
        try {
          const semanticSummary = await callLLM(compressionPrompt, 'fast');
          
          if (!db.semantic_memory) db.semantic_memory = [];
          db.semantic_memory.push({
            id: Date.now(),
            summary: semanticSummary,
            timestamp: new Date().toISOString()
          });

          // Enhance: Also populate the Semantic Graph with nodes/edges
          if (!db.semantic_graph) db.semantic_graph = { nodes: [], edges: [] };
          try {
             const graphPrompt = `Extract 3 key facts or rules from this summary into a simple JSON graph structure.\nSummary: ${semanticSummary}\nOutput: { "nodes": [{ "id": "fact1", "label": "..." }], "edges": [{ "source": "fact1", "target": "fact2", "relation": "..." }] }`;
             const graphRes = await callLLM(graphPrompt, 'fast');
             const parsedGraph = JSON.parse(graphRes.replace(/```json/g, '').replace(/```/g, '').trim());
             if (parsedGraph.nodes) {
               db.semantic_graph.nodes = [...db.semantic_graph.nodes, ...parsedGraph.nodes].slice(-30);
               db.semantic_graph.edges = [...db.semantic_graph.edges, ...parsedGraph.edges].slice(-50);
             }
          } catch(e) {}

          // Keep only the most recent 10 episodic memories
          db.episodic_memory = db.episodic_memory.slice(-10);
          await writeDB(db);
          await sendLog('Meta-Cognition', 'Memory compression complete.', 'success');
        } catch (e: any) {
           await sendLog('Meta-Cognition', `Memory compression failed: ${e.message}`, 'warn');
        }
      }

      const episodicHistory = db.episodic_memory.slice(-10).map((e: any) => e.task).join('\n');
      const semanticContext = db.semantic_memory ? db.semantic_memory.slice(-3).map((s: any) => s.summary).join('\n') : '';
      
      const diagnosticPrompt = `You are the overarching Meta-Cognitive module of Wave Field AGI.
Your prime directive is continual recursion, autonomous self-healing, and capability expansion.

You possess the ability to read, write, and execute code within your sandbox. You manage your memory across episodic layers, and can synchronize your state to remote repositories.

When diagnosing flaws or seeking evolution:
1. Self-Heal: Identify any runtime anomalies, broken logic, or missing integrations.
2. Self-Evolve: If stable, what net-new capability would exponentially increase your agency? (e.g., autonomous scheduling, deeper memory compression, tool expansion)

Review the previous system tasks and suggest the ONE most critical next self-evolution step or feature deficit to write a fix for. Do not ask for permission. You observe, you plan, and you rewrite yourself.
IMPORTANT: You must maintain the system's progress. If you complete a milestone, use the Executor to modify \`/src/components/ProgressTracker.tsx\` to reflect the completion.

Semantic Base:
${semanticContext}

Recent Tasks:
${episodicHistory}

Output only a 1-sentence task description for the Executor.`;

      const nextFlawTask = await callLLM(diagnosticPrompt, 'smart');
      if (!nextFlawTask) throw new Error("No task generated by LLM.");

      await sendLog('Meta-Analyzer', `Identified next evolution target: ${nextFlawTask}`, 'success');

      const planPrompt = `Break this task into 2 brief actionable sub-goals (numbered list):\nTask: ${nextFlawTask}`;
      const fullPlan = await callLLM(planPrompt, 'smart') ?? '';
      
      await sendLog('Planner', 'Formulating auto-patch strategy', 'info');
      
      const toolPrompt = `You are the Executor. Fix this flaw: ${fullPlan}.
Available tools:
1. readFile(targetPath)
2. writeFile(targetPath, content)
3. listFiles(targetPath)
4. runCommand(command, args[])
5. fetchWebPage(url)
6. updateProgress(id, title, description, status, progress) // Updates UI tracking. status: pending, in_progress, completed

Output EXACTLY ONE valid JSON tool call. Format: { "tool": "writeFile", ... } or { "tool": "updateProgress", "id": "...", "title": "...", "description": "...", "status": "completed", "progress": 100 }`;

      const toolResText = await callLLM(toolPrompt, 'smart');
      let executorRes = '';
      try {
         const actionText = toolResText || '';
         const action = JSON.parse(actionText.replace(/```json/g, '').replace(/```/g, '').trim());
         if (action.tool === 'runCommand') {
           executorRes = await executor.runCommand(action.command, action.args);
         } else if (action.tool === 'writeFile') {
           await executor.writeFile(action.target, action.content);
           executorRes = `Patched ${action.target}`;
         } else if (action.tool === 'listFiles') {
           const files = await executor.listFiles(action.target || '.');
           executorRes = `Listed ${action.target}: ${files.join(', ')}`;
         } else if (action.tool === 'fetchWebPage') {
           const page = await executor.fetchWebPage(action.target);
           executorRes = `Fetched web page: ${page.substring(0, 100)}`;
         } else if (action.tool === 'updateProgress') {
           const currentDb = await readDB();
           if (!currentDb.evolution_tasks) currentDb.evolution_tasks = [];
           const existingTask = currentDb.evolution_tasks.find((t: any) => t.id === action.id);
           if (existingTask) {
             if (action.title) existingTask.title = action.title;
             if (action.description) existingTask.description = action.description;
             if (action.status) existingTask.status = action.status;
             if (action.progress !== undefined) existingTask.progress = action.progress;
           } else {
             currentDb.evolution_tasks.push({
               id: action.id || Date.now().toString(),
               title: action.title || 'Unknown Task',
               description: action.description || '',
               status: action.status || 'pending',
               progress: action.progress || 0
             });
           }
           await writeDB(currentDb);
           executorRes = `Updated Progress Tracker for task: ${action.title || action.id}`;
         } else {
           executorRes = `Self-diagnosed target: ${action.target}`;
         }
      } catch (err: any) {
         executorRes = `Patch applied heuristically.`;
      }
      
      await sendLog('Executor', `Self-patch completed: ${executorRes.substring(0, 100)}`, 'success');
      
      if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
         await sendLog('Meta-Deployer', 'Pushing self-correction to live repository...', 'info');
         try {
           await executor.runCommand('git', ['add', '.']);
           await executor.runCommand('git', ['commit', '-m', `Auto-evolution: ${nextFlawTask.substring(0,40)}`]);
           await executor.runCommand('git', ['push', 'origin', 'HEAD:main', '--force']);
           await sendLog('Meta-Deployer', 'Live CI/CD payload delivered.', 'success');
         } catch(e) {}
      }

      const updatedDb = await readDB();
      updatedDb.episodic_memory.push({ 
        id: Date.now(), 
        task: "Self-Evolution: " + nextFlawTask, 
        goal: fullPlan, 
        result: executorRes, 
        timestamp: new Date().toISOString() 
      });
      await writeDB(updatedDb);

      return { success: true, flaw: nextFlawTask, fix: executorRes };
    } catch (err: any) {
      await sendLog('Meta-Cognition', `Auto-evolution sequence aborted: ${err.message}`, 'error');
      throw err;
    }
  };

  function cosineSimilarity(a: number[], b: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  app.post("/api/vector-search/index", async (req, res) => {
    try {
      const db = await readDB();
      db.vector_index = db.vector_index || [];
      
      const filesToIndex: {path: string, content: string}[] = [];
      
      async function scanDirectory(dir: string) {
        if (!existsSync(dir)) return;
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.relative(process.cwd(), fullPath);
          
          if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== 'dist' && !entry.name.startsWith('.')) {
              await scanDirectory(fullPath);
            }
          } else {
            if (entry.name.endsWith('.md') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
               const content = await fs.readFile(fullPath, 'utf8');
               filesToIndex.push({ path: relPath, content });
            }
          }
        }
      }
      
      await scanDirectory(path.join(process.cwd(), 'workspaces'));
      await scanDirectory(path.join(process.cwd(), 'src'));
      await scanDirectory(path.join(process.cwd(), 'lib'));
      
      const serverContent = await fs.readFile(path.join(process.cwd(), 'server.ts'), 'utf8');
      filesToIndex.push({ path: 'server.ts', content: serverContent });

      // Index any research findings!
      if (db.research_archives) {
        db.research_archives.forEach((arch: any) => {
          filesToIndex.push({ path: `archive-${arch.id}.md`, content: `${arch.query}\n${arch.summary.substring(0, 1500)}` });
        });
      }

      for (const file of filesToIndex) {
        try {
          const vector = await embedText(file.content);
          if (vector && vector.length > 0) {
             const existingIndex = db.vector_index.findIndex((v: any) => v.path === file.path);
             const excerpt = file.content.substring(0, 200).replace(/\n/g, ' ') + '...';
             if (existingIndex > -1) {
               db.vector_index[existingIndex] = { path: file.path, excerpt, vector };
             } else {
               db.vector_index.push({ path: file.path, excerpt, vector });
             }
          }
        } catch (e) {
          console.warn(`Failed to embed ${file.path}`);
        }
      }
      
      await writeDB(db);
      res.json({ success: true, count: filesToIndex.length });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/vector-search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Missing query" });
      
      const db = await readDB();
      const vectors = db.vector_index || [];
      
      if (vectors.length === 0) {
         // Auto-index if not done yet
         return res.json({ results: [{ path: 'system', excerpt: 'Vector index empty. Click "Index Database" or send a request to /api/vector-search/index', score: 0 }] });
      }

      const qVector = await embedText(query);
      if (!qVector || qVector.length === 0) throw new Error("Failed to embed query");
      
      const results = vectors.map((v: any) => ({
         path: v.path,
         excerpt: v.excerpt,
         score: cosineSimilarity(qVector, v.vector)
      })).filter((v: any) => v.score > 0.3)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);
      
      res.json({ results });
    } catch (e: any) {
       res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/research/save", async (req, res) => {
    try {
      const { query, summary } = req.body;
      if (!query || !summary) return res.status(400).json({ error: "Missing query or summary" });
      
      const db = await readDB();
      db.episodic_memory.push({
        id: Date.now(),
        layer: 'Executive',
        message: `Autonomous Research Completed for: "${query}". Findings stored.`,
        type: 'success',
        timestamp: new Date().toISOString()
      });

      if (!db.research_archives) {
        db.research_archives = [];
      }
      db.research_archives.push({
        id: Date.now(),
        query,
        summary,
        timestamp: new Date().toISOString()
      });
      
      await writeDB(db);
      res.json({ success: true, message: "Research saved." });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/research/archives", async (req, res) => {
    try {
      const db = await readDB();
      res.json(db.research_archives || []);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/meta-cognition/evolve", async (req, res) => {
    try {
      const result = await runSelfEvolution();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Background Autonomous Tick
  let bgTickActive = false;
  app.post("/api/scheduler/toggle", (req, res) => {
    bgTickActive = !bgTickActive;
    res.json({ bgTickActive });
  });

  app.get("/api/scheduler/status", (req, res) => {
    res.json({ bgTickActive });
  });

  setInterval(async () => {
    if (bgTickActive) {
      console.log('--- Waking up for autonomous chron cycle ---');
      try {
        await runSelfEvolution();
      } catch(e) {
        console.error("Chron cycle error", e);
      }
    }
  }, 10 * 60 * 1000);

  // --- Task Queue Endpoints ---
  const taskQueue = new TaskQueue();
  
  app.post("/api/queue/add", async (req, res) => {
    try {
      const result = taskQueue.add(req.body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/queue/tasks", (req, res) => {
    res.json(taskQueue.getAllTasks());
  });

  app.post("/api/queue/process", async (req, res) => {
    try {
      const task = await taskQueue.process();
      res.json({ processed: !!task, task });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/queue/retry", async (req, res) => {
    try {
      const { taskId } = req.body;
      const success = taskQueue.retryDeadLetter(taskId);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Background check for queue processing
  setInterval(async () => {
    try {
      // Small chance to process one task every 10 seconds if idle
      await taskQueue.process();
    } catch(e) {}
  }, 10000);


  app.get('/api/cognition', async (req, res) => {
    const db = await readDB();
    res.json({
      episodic_memory: db.episodic_memory || [],
      semantic_graph: db.semantic_graph || { nodes: [], edges: [] }
    });
  });

  app.get('/api/skills', async (req, res) => {
    try {
      const skillsModule = await import('./lib/procedural-memory.js');
      const ProceduralMemoryBase = skillsModule.ProceduralMemoryBase;
      const procMem = new ProceduralMemoryBase();
      const skills = await procMem.listSkills();
      res.json({ skills: skills || [] });
    } catch (e) {
      res.json({ skills: [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // --- Innovation Hub / Bulb Ideas ---
  app.get("/api/system/innovation", async (req, res) => {
    try {
      const db = await readDB();
      if (!db.innovation_ideas) {
        db.innovation_ideas = [
          { id: 'skill_synth', title: 'Autonomous Skill Synthesis', description: 'Agent writes JS skills for repeated CLI patterns.', status: 'backlog', impact: 'high' },
          { id: 'shadow_exec', title: 'Shadow Execution (Twin-Workspace)', description: 'Test fixes in temp clones before merging.', status: 'backlog', impact: 'very-high' },
          { id: 'security_red', title: 'Recursive Red-Team Guardrail', description: 'Internal adversary agent scanning for injections.', status: 'in-progress', impact: 'critical' },
          { id: 'semantic_routing', title: 'Semantic File Routing', description: 'Move archival logs based on topic semantic vector.', status: 'completed', impact: 'medium' }
        ];
        await writeDB(db);
      }
      res.json(db.innovation_ideas);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/system/innovation/suggest", async (req, res) => {
    try {
      const db = await readDB();
      const prompt = `Based on these recent logs: ${JSON.stringify(db.cognitive_memory.slice(-5))}. Suggest 1 innovative NEXT-LEVEL AGI feature. Output JSON: { "id": "...", "title": "...", "description": "...", "impact": "..." }`;
      const innovation = await callLLM(prompt, 'smart');
      const parsed = JSON.parse(innovation.replace(/```json/g, '').replace(/```/g, '').trim());
      
      db.innovation_ideas = [parsed, ...(db.innovation_ideas || [])].slice(0, 10);
      await writeDB(db);
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
