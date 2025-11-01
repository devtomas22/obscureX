/**
 * Tool: Retrieve Long-Term Memory
 * Retrieves information from long-term memory
 */
export default {
  name: 'retrieveLongTermMemory',
  description: 'Retrieve information from long-term memory',
  parameters: { key: 'string' },
  
  async execute(params, context) {
    const { key } = params;
    const { longTermMemory } = context;
    
    const entry = longTermMemory.entries.find(e => e.key === key);
    
    if (!entry) {
      return {
        success: false,
        message: `Key '${key}' not found in long-term memory`,
        value: null
      };
    }
    
    return {
      success: true,
      key: entry.key,
      value: entry.value,
      metadata: entry.metadata,
      history: entry.history || []
    };
  }
};
