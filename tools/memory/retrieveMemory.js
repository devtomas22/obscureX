/**
 * Tool: Retrieve Memory
 * Retrieves information from short-term memory
 */
export default {
  name: 'retrieveMemory',
  description: 'Retrieve information from short-term memory',
  parameters: { key: 'string' },
  
  async execute(params, context) {
    const { key } = params;
    const { memory } = context;
    
    const entry = memory.entries.find(e => e.key === key);
    
    if (!entry) {
      return {
        success: false,
        message: `Key '${key}' not found in short-term memory`,
        value: null
      };
    }
    
    return {
      success: true,
      key: entry.key,
      value: entry.value,
      metadata: entry.metadata
    };
  }
};
