import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

/**
 * Tool: Test ML Pipeline
 * Executes a Python ML pipeline and extracts MSE value
 * Works with Binance price data CSV format
 */
export default {
  name: 'testMLPipeline',
  description: 'Execute a Python ML pipeline for price prediction and return MSE value (works with Binance data)',
  parameters: { pythonCode: 'string' },
  
  async execute(params) {
    const { pythonCode } = params;
    
    // Create a temporary Python file
    const tempFile = join(tmpdir(), `ml_pipeline_${randomBytes(8).toString('hex')}.py`);
    
    try {
      writeFileSync(tempFile, pythonCode, 'utf-8');
      
      // Execute the Python script and capture output
      const output = execSync(`python3 ${tempFile}`, { 
        encoding: 'utf-8',
        timeout: 300000 // 5 minutes timeout
      });
      
      // Try to extract MSE from output
      const mseMatch = output.match(/MSE[:\s=]+([0-9.]+)/i);
      let mse;
      
      if (mseMatch) {
        mse = parseFloat(mseMatch[1]);
      } else {
        // Try to parse the last line as a number
        const lines = output.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const numberMatch = lastLine.match(/([0-9.]+)/);
        if (numberMatch) {
          mse = parseFloat(numberMatch[1]);
        }
      }
      
      return {
        success: true,
        mse: mse,
        output: output,
        message: mse !== undefined ? `Pipeline executed successfully. MSE: ${mse}` : 'Pipeline executed but MSE not found in output'
      };
    } catch (error) {
      return {
        success: false,
        mse: null,
        error: error.message,
        message: `Pipeline execution failed: ${error.message}`
      };
    } finally {
      // Clean up temp file
      try {
        if (existsSync(tempFile)) {
          unlinkSync(tempFile);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
};
