import fs from "fs/promises";
import path from "path";
import { embedText } from "./free-llm-router.js";

function cosineSimilarity(A: number[], B: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory cache for embeddings to simulate a fast vector DB
const memoryEmbeddingsCache = new Map<number, number[]>();

export class RAGMemoryLayer {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'db.json');
  }

  async readDB() {
    try {
      const content = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return { cognitive_memory: [], episodic_memory: [], semantic_memory: [] };
    }
  }

  async writeDB(db: any) {
    await fs.writeFile(this.dbPath, JSON.stringify(db, null, 2), 'utf-8');
  }

  // Generate missing embeddings for semantic memory
  async syncEmbeddings() {
    const db = await this.readDB();
    if (!db.semantic_memory) db.semantic_memory = [];

    
    let updated = false;
    for (const memory of db.semantic_memory) {
      if (!memory.embedding && memory.summary) {
        try {
          const emb = await embedText(memory.summary);
          memory.embedding = emb;
          memoryEmbeddingsCache.set(memory.id, emb);
          updated = true;
        } catch (e) {
          console.warn("Failed to generate embedding for memory:", memory.id);
        }
      } else if (memory.embedding) {
        memoryEmbeddingsCache.set(memory.id, memory.embedding);
      }
    }

    if (updated) {
      await this.writeDB(db);
    }
  }

  async retrieveRelevantMemory(query: string, topK: number = 2): Promise<string[]> {
    await this.syncEmbeddings();
    
    let queryEmbedding: number[];
    try {
      queryEmbedding = await embedText(query);
    } catch (e: any) {
      console.warn("RAG retrieval failed to generate query embedding. Error:", e?.message);
      return [];
    }

    const db = await this.readDB();
    if (!db.semantic_memory || db.semantic_memory.length === 0) return [];

    const scored = db.semantic_memory
      .filter((m: any) => m.embedding && m.embedding.length > 0)
      .map((m: any) => ({
        summary: m.summary,
        score: cosineSimilarity(queryEmbedding, m.embedding)
      }))
      .sort((a: any, b: any) => b.score - a.score);

    return scored.slice(0, topK).map((s: any) => s.summary);
  }
}
