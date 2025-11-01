import { execSync } from 'child_process';

/**
 * Tool: List Python Modules
 * Lists all installed Python packages
 */
export default {
  name: 'listPythonModules',
  description: 'List all installed Python packages',
  parameters: {},
  
  async execute(params) {
    try {
      const output = execSync('pip3 list --format=freeze', { 
        encoding: 'utf-8',
        timeout: 30000
      });
      
      // Parse the output to get module names
      const modules = output.trim().split('\n').map(line => {
        const parts = line.split('==');
        return parts[0];
      }).filter(name => name.length > 0);
      
      return modules;
    } catch (error) {
      throw new Error(`Failed to list Python modules: ${error.message}`);
    }
  }
};
