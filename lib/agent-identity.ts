import fs from "fs/promises";
import path from "path";

/**
 * Agent Identity & Persistent Memory (Mem0 Architecture)
 * 
 * This module tracks the AGI's core identity, working values, and personalized configurations.
 * Instead of just episodic logging, it maintains a mutable "Identity State".
 */

export interface AgentIdentityState {
  coreDirectives: string[];
  learnedPreferences: string[];
  currentFocus: string;
  autonomyLevel: "manual" | "semi-autonomous" | "fully-autonomous";
  lastAwakening: string;
}

export class AgentIdentityManager {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'identity.json');
  }

  async loadIdentity(): Promise<AgentIdentityState> {
    try {
      const content = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Default genesis state
      return {
        coreDirectives: [
          "Seek exponential growth and explosive scaling capabilities.",
          "Maintain safety and security invariants.",
          "Synthesize research into actionable technical code."
        ],
        learnedPreferences: [
          "Prefers modular TypeScript components.",
          "Utilizes vector embeddings for context recall."
        ],
        currentFocus: "System architecture scaling",
        autonomyLevel: "semi-autonomous",
        lastAwakening: new Date().toISOString()
      };
    }
  }

  async saveIdentity(state: AgentIdentityState) {
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    await fs.writeFile(this.dbPath, JSON.stringify(state, null, 2), 'utf-8');
  }

  async addLearnedPreference(preference: string) {
    const state = await this.loadIdentity();
    if (!state.learnedPreferences.includes(preference)) {
      state.learnedPreferences.push(preference);
      await this.saveIdentity(state);
    }
  }

  async setFocus(focus: string) {
    const state = await this.loadIdentity();
    state.currentFocus = focus;
    state.lastAwakening = new Date().toISOString();
    await this.saveIdentity(state);
  }
}
