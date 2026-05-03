import fs from "fs/promises";
import path from "path";

export class FolderContextLoader {
  private root: string;

  constructor(workspaceRoot: string) {
    this.root = path.resolve(workspaceRoot);
  }

  async loadContext(currentFolder: string = "") {
    const folderPath = path.join(this.root, currentFolder);
    
    const context = {
      workspaceMap: await this.readFile(path.join(this.root, 'workspace-map.md')),
      folderContext: await this.readFile(path.join(folderPath, 'context.md')),
      brief: await this.readFile(path.join(folderPath, 'brief.md')),
      skills: await this.findSkills(folderPath),
      structure: await this.scanFolder(folderPath)
    };
    
    return this.formatForLLM(context, folderPath);
  }

  private async readFile(filename: string): Promise<string> {
    try {
      return await fs.readFile(filename, 'utf8');
    } catch {
      return ''; 
    }
  }

  private async findSkills(folder: string): Promise<string[]> {
    const skillsDir = path.join(folder, 'skills');
    try {
      const files = await fs.readdir(skillsDir);
      const mdFiles = files.filter(f => f.endsWith('.md')).slice(0, 3);
      const contents = [];
      for (const f of mdFiles) {
        contents.push(`--- ${f} ---\n` + await this.readFile(path.join(skillsDir, f)));
      }
      return contents;
    } catch {
      return [];
    }
  }

  private async scanFolder(folder: string): Promise<string> {
    try {
      const files = await fs.readdir(folder);
      return files.join(', ');
    } catch {
      return '';
    }
  }

  private formatForLLM(context: any, currentFolderPath: string) {
    return `
## Workspace Context Loaded

**Current Folder**: ${path.basename(currentFolderPath)}
**Files Inside Folder**: ${context.structure}

### Global Rules (workspace-map.md)
${context.workspaceMap ? context.workspaceMap.slice(0, 1000) : "No global rules defined."}

### Folder Context (context.md)  
${context.folderContext ? context.folderContext.slice(0, 2000) : "No specific folder context."}

### Brief (brief.md)
${context.brief ? context.brief : "No brief provided."}

### Relevant Skills
${context.skills.length > 0 ? context.skills.join('\n') : "No specific skills attached to this folder."}

**Task Guidance**: Use only the context above. Follow folder rules exactly. Keep output relevant to the current layer.
`;
  }
}
