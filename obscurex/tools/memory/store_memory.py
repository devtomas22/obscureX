"""
Tool: Store Memory
Stores information in short-term memory (session-based)
"""

from datetime import datetime
from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Store information in short-term memory."""
    key = params.get('key')
    value = params.get('value')
    metadata = params.get('metadata', {})
    
    memory = context['memory']
    session_id = context['sessionId']
    save_memory = context['saveMemory']
    memory_path = context['memoryPath']
    
    entry = {
        'key': key,
        'value': value,
        'metadata': {
            **metadata,
            'sessionId': session_id,
            'timestamp': datetime.now().isoformat()
        }
    }
    
    # Check if key exists and update, otherwise add new
    existing_index = None
    for i, e in enumerate(memory['entries']):
        if e['key'] == key:
            existing_index = i
            break
    
    if existing_index is not None:
        memory['entries'][existing_index] = entry
    else:
        memory['entries'].append(entry)
    
    save_memory(memory_path, memory)
    
    return {
        'success': True,
        'message': f"Stored '{key}' in short-term memory",
        'entry': entry
    }


# Tool definition
tool = {
    'name': 'storeMemory',
    'description': 'Store information in short-term memory (session-based)',
    'parameters': {'key': 'string', 'value': 'any', 'metadata': 'object'},
    'execute': execute
}
