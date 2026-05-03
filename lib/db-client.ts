import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export class DBClient {
  private filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async read(): Promise<any> {
    try {
      if (!existsSync(this.filePath)) {
        return { cognitive_memory: [], episodic_memory: [], execution_plan: [], evolution_tasks: [] };
      }
      const content = await fs.readFile(this.filePath, 'utf-8');
      if (!content || content.trim().length === 0) {
        return { cognitive_memory: [], episodic_memory: [], execution_plan: [], evolution_tasks: [] };
      }
      return JSON.parse(content);
    } catch (e) {
      console.error("[DBClient]: Read error:", e);
      return { cognitive_memory: [], episodic_memory: [], execution_plan: [], evolution_tasks: [] };
    }
  }

  async write(data: any): Promise<void> {
    // Chain writes to ensure atomicity within the process
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        // Enforce caps to prevent large file growth
        if (data.cognitive_memory) data.cognitive_memory = data.cognitive_memory.slice(-100);
        if (data.episodic_memory) data.episodic_memory = data.episodic_memory.slice(-50);
        if (data.webhooks) data.webhooks = data.webhooks.slice(-20);
        
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
      } catch (e) {
        console.error("[DBClient]: Write error:", e);
      }
    });
    return this.writeQueue;
  }

  async update(callback: (data: any) => void): Promise<void> {
    const data = await this.read();
    callback(data);
    await this.write(data);
  }
}
