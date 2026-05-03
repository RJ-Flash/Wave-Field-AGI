import fs from 'fs/promises';
import path from 'path';

export interface ProceduralSkill {
  name: string;
  description: string;
  code: string;
}

export class ProceduralMemoryBase {
  private skillsDir: string;

  constructor() {
    this.skillsDir = path.join(process.cwd(), 'workspaces', 'skills');
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(this.skillsDir, { recursive: true });
    } catch (e) {
      // Ignore
    }
  }

  async saveSkill(skill: ProceduralSkill): Promise<void> {
    const filePath = path.join(this.skillsDir, `${skill.name}.json`);
    await fs.writeFile(filePath, JSON.stringify(skill, null, 2), 'utf-8');
  }

  async loadSkill(name: string): Promise<ProceduralSkill | null> {
    const filePath = path.join(this.skillsDir, `${name}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async listSkills(): Promise<ProceduralSkill[]> {
    try {
      const files = await fs.readdir(this.skillsDir);
      const skills: ProceduralSkill[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.skillsDir, file), 'utf-8');
          skills.push(JSON.parse(content));
        }
      }
      return skills;
    } catch {
      return [];
    }
  }
}
