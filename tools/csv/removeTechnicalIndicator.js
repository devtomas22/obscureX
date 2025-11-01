import { existsSync, readFileSync, writeFileSync } from 'fs';

/**
 * Tool: Remove Technical Indicator
 * Removes a technical indicator column from a CSV file
 * Works with Binance CSV format and other price data formats
 */
export default {
  name: 'removeTechnicalIndicator',
  description: 'Remove a technical indicator from a CSV file (works with Binance price data)',
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

    const headers = lines[0].split(',').map(h => h.trim());
    const indicatorIndex = headers.indexOf(indicatorName);

    if (indicatorIndex === -1) {
      throw new Error(`Indicator '${indicatorName}' not found in the CSV`);
    }

    // Remove the indicator from each line
    const updatedLines = lines.map(line => {
      const columns = line.split(',');
      columns.splice(indicatorIndex, 1);
      return columns.join(',');
    });

    writeFileSync(filename, updatedLines.join('\n') + '\n', 'utf-8');
    
    return { success: true, message: `Indicator '${indicatorName}' removed from ${filename}` };
  }
};
