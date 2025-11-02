"""
Tool: Search Long-Term Memory
Searches through long-term memory
"""

from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Search through long-term memory."""
    query = params.get('query', '').lower()
    long_term_memory = context['longTermMemory']
    
    results = []
    for entry in long_term_memory['entries']:
        # Search in key, value (if string), and metadata
        key_match = query in str(entry['key']).lower()
        value_match = query in str(entry['value']).lower()
        metadata_match = query in str(entry.get('metadata', {})).lower()
        
        if key_match or value_match or metadata_match:
            # Don't include full history in search results
            result_entry = {
                'key': entry['key'],
                'value': entry['value'],
                'metadata': entry['metadata'],
                'historyCount': len(entry.get('history', []))
            }
            results.append(result_entry)
    
    return {
        'success': True,
        'query': query,
        'count': len(results),
        'results': results
    }


# Tool definition
tool = {
    'name': 'searchLongTermMemory',
    'description': 'Search through long-term memory',
    'parameters': {'query': 'string'},
    'execute': execute
}
