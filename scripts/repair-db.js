import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

async function repair() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!existsSync(dataDir)) return;

  const files = await fs.readdir(dataDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(dataDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        if (!content || content.trim().length === 0) {
          console.log(`[Repair]: Initializing empty file ${file}`);
          await fs.writeFile(filePath, '{}', 'utf-8');
        } else {
          JSON.parse(content);
        }
      } catch (e) {
        console.log(`[Repair]: Resetting corrupted file ${file}`);
        await fs.writeFile(filePath, '{}', 'utf-8');
      }
    }
  }
}
repair();
