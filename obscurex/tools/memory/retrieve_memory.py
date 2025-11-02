"""
Tool: Retrieve Memory
Retrieves information from short-term memory
"""

from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieve information from short-term memory."""
    key = params.get('key')
    memory = context['memory']
    
    entry = None
    for e in memory['entries']:
        if e['key'] == key:
            entry = e
            break
    
    if not entry:
        return {
            'success': False,
            'message': f"Key '{key}' not found in short-term memory",
            'value': None
        }
    
    return {
        'success': True,
        'key': entry['key'],
        'value': entry['value'],
        'metadata': entry['metadata']
    }


# Tool definition
tool = {
    'name': 'retrieveMemory',
    'description': 'Retrieve information from short-term memory',
    'parameters': {'key': 'string'},
    'execute': execute
}
