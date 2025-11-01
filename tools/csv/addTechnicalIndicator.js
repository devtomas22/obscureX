import { existsSync, readFileSync, writeFileSync } from 'fs';

/**
 * Tool: Add Technical Indicator
 * Adds a new technical indicator column to a CSV file
 * Works with Binance CSV format and other price data formats
 */
export default {
  name: 'addTechnicalIndicator',
  description: 'Add a technical indicator column to a CSV file (works with Binance price data)',
  parameters: { filename: 'string', indicatorName: 'string' },
  
  async execute(params) {
    const { filename, indicatorName } = params;
    
    if (!existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    const content = readFileSync(filename, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Check if indicator already exists
    const headers = lines[0].split(',').map(h => h.trim());
    if (headers.includes(indicatorName)) {
      throw new Error(`Indicator '${indicatorName}' already exists in the CSV`);
    }

    // Add the indicator to header
    lines[0] = lines[0] + ',' + indicatorName;

    // Add placeholder value (0) for each data row
    for (let i = 1; i < lines.length; i++) {
      lines[i] = lines[i] + ',0';
    }

    writeFileSync(filename, lines.join('\n') + '\n', 'utf-8');
    
    return { success: true, message: `Indicator '${indicatorName}' added to ${filename}` };
  }
};
