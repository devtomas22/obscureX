import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Tool Loader
 * Dynamically loads all tools from the tools directory
 */
export async function loadTools() {
  const toolsBaseDir = __dirname;  // This is the tools/ directory itself
  const tools = [];
  
  // Categories to load
  const categories = ['csv', 'ml', 'memory', 'binance', 'analysis', 'autonomy'];
  
  for (const category of categories) {
    const categoryPath = join(toolsBaseDir, category);
    
    try {
      const files = await readdir(categoryPath);
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          const toolPath = join(categoryPath, file);
          const toolModule = await import(toolPath);
          const tool = toolModule.default;
          
          if (tool && tool.name && tool.execute) {
            tools.push({
              ...tool,
              category: category,
              file: file
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not load tools from ${category}:`, error.message);
    }
  }
  
  return tools;
}

/**
 * Get tool by name
 */
export function getTool(tools, toolName) {
  return tools.find(t => t.name === toolName);
}

/**
 * List all tools with metadata
 */
export function listTools(tools) {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
    category: t.category
  }));
}
