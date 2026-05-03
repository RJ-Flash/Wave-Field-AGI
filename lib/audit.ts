import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export interface AuditGap {
  id: string;
  severity: 'low' | 'medium' | 'high';
  category: 'security' | 'architecture' | 'performance' | 'reliability';
  description: string;
  recommendation: string;
}

export class SystemAuditor {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async performAudit(): Promise<AuditGap[]> {
    const gaps: AuditGap[] = [];

    // 1. Check for .env.example vs .env consistency
    if (existsSync(path.join(this.rootDir, '.env.example'))) {
       // logic to compare keys...
    }

    // 2. Check for episodic memory size (reliability gap)
    const dbPath = path.join(this.rootDir, 'data', 'db.json');
    if (existsSync(dbPath)) {
      try {
        const stats = await fs.stat(dbPath);
        if (stats.size > 5 * 1024 * 1024) { // > 5MB
           gaps.push({
             id: 'db_size_limit',
             severity: 'medium',
             category: 'performance',
             description: 'Internal JSON database is exceeding recommended size (5MB).',
             recommendation: 'Implement shard-based storage or SQLite migration.'
           });
        }
      } catch(e) {}
    }

    // 3. Scan for "TODO" or "FIXME" in src (technical debt)
    const srcGaps = await this.scanForTechnicalDebt(path.join(this.rootDir, 'src'));
    gaps.push(...srcGaps);

    // 4. Security Audit: Check for eval usage or sensitive patterns
    const securityGaps = await this.scanSecurityRisks(path.join(this.rootDir, 'src'));
    gaps.push(...securityGaps);

    return gaps;
  }

  private async scanForTechnicalDebt(dir: string): Promise<AuditGap[]> {
    const gaps: AuditGap[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        gaps.push(...await this.scanForTechnicalDebt(path.join(dir, entry.name)));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const content = await fs.readFile(path.join(dir, entry.name), 'utf-8');
        if (content.includes('TODO')) {
            gaps.push({
                id: `debt_${entry.name}_${Math.random().toString(36).substr(2, 4)}`,
                severity: 'low',
                category: 'reliability',
                description: `Unresolved TODO found in ${entry.name}.`,
                recommendation: 'Complete the implementation or use the Executor to automate the fix.'
            });
        }
      }
    }
    return gaps;
  }

  private async scanSecurityRisks(dir: string): Promise<AuditGap[]> {
    const gaps: AuditGap[] = [];
    // placeholder logic - in a real system this would use a static analyzer
    return gaps;
  }
}
