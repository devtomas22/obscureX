"""
Tool: Search Memory
Searches through short-term memory
"""

from typing import Dict, Any, List


async def execute(params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Search through short-term memory."""
    query = params.get('query', '').lower()
    memory = context['memory']
    
    results = []
    for entry in memory['entries']:
        # Search in key, value (if string), and metadata
        key_match = query in str(entry['key']).lower()
        value_match = query in str(entry['value']).lower()
        metadata_match = query in str(entry.get('metadata', {})).lower()
        
        if key_match or value_match or metadata_match:
            results.append(entry)
    
    return {
        'success': True,
        'query': query,
        'count': len(results),
        'results': results
    }


# Tool definition
tool = {
    'name': 'searchMemory',
    'description': 'Search through short-term memory',
    'parameters': {'query': 'string'},
    'execute': execute
}
