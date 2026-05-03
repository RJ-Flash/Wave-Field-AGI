import fs from 'fs/promises';
import path from 'path';

export interface SemanticNode {
  id: string;
  label: string;
  type: string;
}

export interface SemanticEdge {
  source: string;
  target: string;
  relation: string;
}

export class SemanticKnowledgeGraph {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'db.json');
  }

  private async readDB() {
    try {
      const content = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { semantic_graph: { nodes: [], edges: [] } };
    }
  }

  private async writeDB(data: any) {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async addFact(subject: string, relation: string, object: string) {
    const db = await this.readDB();
    if (!db.semantic_graph) db.semantic_graph = { nodes: [], edges: [] };

    const subjectNode = { id: subject.toLowerCase(), label: subject, type: 'entity' };
    const objectNode = { id: object.toLowerCase(), label: object, type: 'entity' };

    const nodesMap = new Map(db.semantic_graph.nodes.map((n: any) => [n.id, n]));
    nodesMap.set(subjectNode.id, subjectNode);
    nodesMap.set(objectNode.id, objectNode);

    db.semantic_graph.nodes = Array.from(nodesMap.values());

    // Prevent duplicate edges
    const exists = db.semantic_graph.edges.find((e: any) => e.source === subjectNode.id && e.target === objectNode.id && e.relation === relation);
    if (!exists) {
      db.semantic_graph.edges.push({
        source: subjectNode.id,
        target: objectNode.id,
        relation
      });
    }

    await this.writeDB(db);
  }

  async getGraph() {
    const db = await this.readDB();
    return db.semantic_graph || { nodes: [], edges: [] };
  }
}
