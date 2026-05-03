import path from 'path';
import fs from 'fs/promises';
import { RAGMemoryLayer } from './vector-rag.js';
import { callLLM } from './free-llm-router.js';

export interface EpisodicEvent {
  id: string;
  timestamp: string;
  task?: string;
  goal?: string;
  result?: string;
  trigger?: string;
  observation?: string;
  context?: string;
  embedding?: number[];
}

export class EpisodicMemoryPipeline {
  private dbPath: string;
  private ragLayer: RAGMemoryLayer;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'db.json');
    this.ragLayer = new RAGMemoryLayer();
  }

  private async readDB() {
    try {
      const content = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { episodic_memory: [], semantic_memory: [] };
    }
  }

  private async writeDB(data: any) {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async appendEvent(eventBase: Omit<EpisodicEvent, 'id' | 'timestamp'>) {
    const db = await this.readDB();
    if (!db.episodic_memory) db.episodic_memory = [];

    const newEvent: EpisodicEvent = {
       ...eventBase,
       id: Date.now().toString(),
       timestamp: new Date().toISOString()
    };
    db.episodic_memory.push(newEvent);

    // Keep memory manageable
    if (db.episodic_memory.length > 500) {
      await this.compressMemoryWindow(db);
    } else {
      await this.writeDB(db);
    }
  }

  private async compressMemoryWindow(db: any) {
    const window = db.episodic_memory.slice(0, 100);
    const textToSummarize = window.map((e: any) => `[${e.timestamp}] Task: ${e.task || e.trigger} | Result: ${e.result || e.observation}`).join('\\n');
    
    // Extract rule / fact to semantic memory
    try {
       const summaryPrompt = `You are the Memory Compressor. Analyze this chronolog of recent events:\n${textToSummarize}\n\nProduce a 2-3 sentence semantic summary of any important lessons or state changes to retain.`;
       const summary = await callLLM(summaryPrompt, 'fast');
       
       if (!db.semantic_memory) db.semantic_memory = [];
       db.semantic_memory.push({
         id: Date.now(),
         summary,
         createdAt: new Date().toISOString()
       });

       // Remove the window we just summarized
       db.episodic_memory = db.episodic_memory.slice(100);
    } catch (e) {
       console.warn("Failed to compress memory window:", e);
    }
    
    await this.writeDB(db);
    // sync vectors for the new semantic nodes
    this.ragLayer.syncEmbeddings();
  }
}
