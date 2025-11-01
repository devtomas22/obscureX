/**
 * Tool: Search Memory
 * Searches through short-term memory
 */
export default {
  name: 'searchMemory',
  description: 'Search through short-term memory',
  parameters: { query: 'string' },
  
  async execute(params, context) {
    const { query } = params;
    const { memory } = context;
    
    const queryLower = query.toLowerCase();
    const results = memory.entries.filter(entry => {
      const keyMatch = entry.key.toLowerCase().includes(queryLower);
      const valueMatch = JSON.stringify(entry.value).toLowerCase().includes(queryLower);
      return keyMatch || valueMatch;
    });
    
    return {
      success: true,
      query,
      results: results.map(e => ({
        key: e.key,
        value: e.value,
        metadata: e.metadata
      })),
      count: results.length
    };
  }
};
