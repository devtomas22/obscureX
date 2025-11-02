"""
Tool: Retrieve Long-Term Memory
Retrieves information from long-term memory
"""

from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieve information from long-term memory."""
    key = params.get('key')
    long_term_memory = context['longTermMemory']
    
    entry = None
    for e in long_term_memory['entries']:
        if e['key'] == key:
            entry = e
            break
    
    if not entry:
        return {
            'success': False,
            'message': f"Key '{key}' not found in long-term memory",
            'value': None
        }
    
    return {
        'success': True,
        'key': entry['key'],
        'value': entry['value'],
        'metadata': entry['metadata'],
        'historyCount': len(entry.get('history', []))
    }


# Tool definition
tool = {
    'name': 'retrieveLongTermMemory',
    'description': 'Retrieve information from long-term memory',
    'parameters': {'key': 'string'},
    'execute': execute
}
