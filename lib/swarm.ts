import { callLLM } from "./free-llm-router.js";
import { SandboxExecutor } from "./executor.js";

/**
 * Swarm / Multi-Agent Orchestration Engine
 * 
 * Allows the primary cognitive loop to spin up dedicated sub-agents
 * with specialized roles and limited toolsets.
 */

export interface SubAgentTask {
  role: string;
  goal: string;
  context: string;
}

export class AgentSwarm {
  private executor: SandboxExecutor;

  constructor(workspaceDir: string) {
    this.executor = new SandboxExecutor(workspaceDir);
  }

  async dispatchTask(task: SubAgentTask): Promise<string> {
    const systemPrompt = `You are a specialized sub-agent within a larger AGI Swarm.
ROLE: ${task.role}
GOAL: ${task.goal}
CONTEXT provided by the main system:
${task.context}

Execute your goal. Provide your final analysis or code synthesis.
You are strictly focused on your specialized role. Do not perform tasks outside of this scope.`;

    // In a real deployed version, we could parallelize LLM calls or even route 
    // to different models based on the role (e.g., coding -> gemini-coder).
    
    // For now we simulate the interaction using the free-llm-router (which abstracts the Gemini API)
    try {
      const response = await callLLM(systemPrompt + "\n\nBegin execution and provide output.", 'smart');
      return response;
    } catch(e: any) {
      return `[Swarm Agent ${task.role} Failed]: ${e.message}`;
    }
  }

  async dispatchParallel(tasks: SubAgentTask[]): Promise<string[]> {
    return Promise.all(tasks.map(t => this.dispatchTask(t)));
  }
}
