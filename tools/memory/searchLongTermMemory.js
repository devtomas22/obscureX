/**
 * Tool: Search Long-Term Memory
 * Searches through long-term memory
 */
export default {
  name: 'searchLongTermMemory',
  description: 'Search through long-term memory',
  parameters: { query: 'string' },
  
  async execute(params, context) {
    const { query } = params;
    const { longTermMemory } = context;
    
    const queryLower = query.toLowerCase();
    const results = longTermMemory.entries.filter(entry => {
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
        metadata: e.metadata,
        historyCount: e.history ? e.history.length : 0
      })),
      count: results.length
    };
  }
};
