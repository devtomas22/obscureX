/**
 * Tool: Store Memory
 * Stores information in short-term memory (session-based)
 */
export default {
  name: 'storeMemory',
  description: 'Store information in short-term memory (session-based)',
  parameters: { key: 'string', value: 'any', metadata: 'object' },
  
  async execute(params, context) {
    const { key, value, metadata = {} } = params;
    const { memory, sessionId, saveMemory, memoryPath } = context;
    
    const entry = {
      key,
      value,
      metadata: {
        ...metadata,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      }
    };
    
    // Check if key exists and update, otherwise add new
    const existingIndex = memory.entries.findIndex(e => e.key === key);
    if (existingIndex !== -1) {
      memory.entries[existingIndex] = entry;
    } else {
      memory.entries.push(entry);
    }
    
    saveMemory(memoryPath, memory);
    
    return {
      success: true,
      message: `Stored '${key}' in short-term memory`,
      entry
    };
  }
};
