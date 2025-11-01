/**
 * Tool: Store Long-Term Memory
 * Stores information in long-term memory (persistent across sessions)
 */
export default {
  name: 'storeLongTermMemory',
  description: 'Store information in long-term memory (persistent across sessions)',
  parameters: { key: 'string', value: 'any', metadata: 'object' },
  
  async execute(params, context) {
    const { key, value, metadata = {} } = params;
    const { longTermMemory, sessionId, saveMemory, longTermMemoryPath } = context;
    
    const entry = {
      key,
      value,
      metadata: {
        ...metadata,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        persistent: true
      }
    };
    
    // Check if key exists and update, otherwise add new
    const existingIndex = longTermMemory.entries.findIndex(e => e.key === key);
    if (existingIndex !== -1) {
      // Keep history of changes
      if (!longTermMemory.entries[existingIndex].history) {
        longTermMemory.entries[existingIndex].history = [];
      }
      longTermMemory.entries[existingIndex].history.push({
        value: longTermMemory.entries[existingIndex].value,
        metadata: longTermMemory.entries[existingIndex].metadata
      });
      longTermMemory.entries[existingIndex] = entry;
    } else {
      longTermMemory.entries.push(entry);
    }
    
    saveMemory(longTermMemoryPath, longTermMemory);
    
    return {
      success: true,
      message: `Stored '${key}' in long-term memory`,
      entry
    };
  }
};
