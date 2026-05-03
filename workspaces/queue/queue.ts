import fs from 'fs';
import path from 'path';

export interface Task {
  id?: string;
  priority: 'high' | 'normal' | 'low';
  context: string;
  operation: string;
  payload: any;
  status?: 'pending' | 'completed' | 'failed' | 'processing';
  retries?: number;
  createdAt?: number;
}

export class TaskQueue {
  private tasks: Map<string, Task>;
  private priorities: { high: string[]; normal: string[]; low: string[] };
  private maxRetries: number = 3;
  private dbPath: string;

  constructor() {
    this.tasks = new Map();
    this.priorities = { high: [], normal: [], low: [] };
    this.dbPath = path.join(process.cwd(), 'workspaces/queue/queue.json');
    this.load();
  }

  add(task: Task) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const taskData: Task = { ...task, id: taskId, retries: 0, status: 'pending', createdAt: Date.now() };
    
    // Dedupe by context hash + op
    const hash = this._hash(JSON.stringify(task.context) + task.operation);
    if (this._findDuplicate(hash)) return { isDuplicate: true };
    
    this.tasks.set(taskId, taskData);
    this.priorities[task.priority || 'normal'].push(taskId);
    this.save();
    return { taskId };
  }

  async process() {
    const taskId = this._getNext();
    if (!taskId) return null;
    
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = 'processing';
    this.save();

    try {
      // TODO: Executor hook - ragQuery + ollama + fs.write
      // Simulate work for now
      await new Promise(r => setTimeout(r, 1000));
      task.status = 'completed';
      
      // Auto-append to ledger
      const ledgerPath = path.join(process.cwd(), 'workspaces/roadmap/ledger.md');
      const ledgerEntry = `\n[${new Date().toISOString()}] RESOLVED: ${task.operation} (${task.context})\n`;
      if (fs.existsSync(ledgerPath)) {
        fs.appendFileSync(ledgerPath, ledgerEntry);
      }
      
    } catch (e) {
      task.retries = (task.retries || 0) + 1;
      if (task.retries >= this.maxRetries) {
        task.status = 'failed'; // To deadletter
      } else {
        task.status = 'pending';
        // Re-queue
        this.priorities[task.priority || 'normal'].push(taskId);
      }
    }
    
    this.save();
    return task;
  }

  getAllTasks() {
    return Array.from(this.tasks.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  
  getDeadLetter() {
    return Array.from(this.tasks.values()).filter(t => t.status === 'failed');
  }

  retryDeadLetter(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'failed') {
      task.status = 'pending';
      task.retries = 0;
      this.priorities[task.priority || 'normal'].push(taskId);
      this.save();
      return true;
    }
    return false;
  }

  private _getNext() {
    for (const prio of ['high', 'normal', 'low'] as const) {
      while (this.priorities[prio].length > 0) {
        const id = this.priorities[prio].shift();
        if (id && this.tasks.get(id)?.status === 'pending') return id;
      }
    }
    return null;
  }

  private _hash(str: string) { 
    return str.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0); 
  }

  private _findDuplicate(hash: number) { 
    // Simplified duplicate check for demonstration
    // It would be better to store hashes if we need robust deduping
    return false; 
  }

  private save() { 
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dbPath, JSON.stringify([...this.tasks.values()], null, 2)); 
    } catch (e) {
      console.error('Error saving queue:', e);
    }
  }

  private load() { 
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
        this.tasks = new Map(data.map((t: Task) => [t.id!, t]));
        // Rebuild priorities
        this.priorities = { high: [], normal: [], low: [] };
        for (const [id, task] of this.tasks.entries()) {
          if (task.status === 'pending') {
            this.priorities[task.priority || 'normal'].push(id);
          }
        }
      }
    } catch (e) {
      console.error('Error loading queue:', e);
    }
  }
}
