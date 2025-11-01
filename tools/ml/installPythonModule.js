import { execSync } from 'child_process';

/**
 * Tool: Install Python Module
 * Installs a Python package using pip
 */
export default {
  name: 'installPythonModule',
  description: 'Install a Python package using pip',
  parameters: { moduleName: 'string' },
  
  async execute(params) {
    const { moduleName } = params;
    
    // Validate module name to prevent shell injection
    const moduleNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!moduleNameRegex.test(moduleName)) {
      return {
        success: false,
        message: `Invalid module name '${moduleName}'. Only alphanumeric characters, hyphens, underscores, and dots are allowed.`,
        error: 'Invalid module name'
      };
    }
    
    try {
      const output = execSync(`pip3 install ${moduleName}`, { 
        encoding: 'utf-8',
        timeout: 300000 // 5 minutes timeout
      });
      
      return {
        success: true,
        message: `Module '${moduleName}' installed successfully`,
        output: output
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install module '${moduleName}': ${error.message}`,
        error: error.message
      };
    }
  }
};
