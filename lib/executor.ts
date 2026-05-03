import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

export class SandboxExecutor {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  private resolvePath(target: string) {
    const resolved = path.resolve(this.workspaceRoot, target);
    if (!resolved.startsWith(this.workspaceRoot)) {
      throw new Error(`Security Violation: Path ${target} is outside of workspace root.`);
    }
    return resolved;
  }

  async readFile(target: string): Promise<string> {
    const safePath = this.resolvePath(target);
    return await fs.readFile(safePath, 'utf-8');
  }

  async writeFile(target: string, content: string): Promise<void> {
    const safePath = this.resolvePath(target);
    await fs.mkdir(path.dirname(safePath), { recursive: true });
    await fs.writeFile(safePath, content, 'utf-8');
  }

  async listFiles(target: string = '.'): Promise<string[]> {
    const safePath = this.resolvePath(target);
    return await fs.readdir(safePath);
  }

  async fetchWebPage(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const text = await response.text();
    // primitive truncating to prevent huge payloads context exhaustion
    return text.substring(0, 5000); 
  }

  async runCommand(command: string, args: string[]): Promise<string> {
    const allowedCommands = ['npm', 'node', 'git'];
    if (!allowedCommands.includes(command)) {
      throw new Error(`Security Violation: Command ${command} is not allowed. Allowed commands: ${allowedCommands.join(', ')}`);
    }

    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { cwd: this.workspaceRoot });
      let out = '';
      let err = '';

      proc.stdout.on('data', d => out += d.toString());
      proc.stderr.on('data', d => err += d.toString());

      proc.on('close', code => {
        if (code === 0) {
          resolve(out || 'Command completed successfully.');
        } else {
          // Send back the error but don't strictly reject the promise ungracefully, 
          // let the LLM see the error to self-correct.
          resolve(`Command failed with exit code ${code}:\n${err}\n${out}`);
        }
      });
    });
  }
}
