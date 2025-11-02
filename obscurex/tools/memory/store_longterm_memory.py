"""
Tool: Store Long-Term Memory
Stores information in long-term memory (persistent across sessions)
"""

from datetime import datetime
from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Store information in long-term memory."""
    key = params.get('key')
    value = params.get('value')
    metadata = params.get('metadata', {})
    
    long_term_memory = context['longTermMemory']
    save_memory = context['saveMemory']
    long_term_memory_path = context['longTermMemoryPath']
    
    # Find existing entry
    existing_entry = None
    existing_index = None
    for i, e in enumerate(long_term_memory['entries']):
        if e['key'] == key:
            existing_entry = e
            existing_index = i
            break
    
    # Create new entry
    entry = {
        'key': key,
        'value': value,
        'metadata': {
            **metadata,
            'timestamp': datetime.now().isoformat()
        },
        'history': []
    }
    
    # If entry exists, save old value to history
    if existing_entry:
        entry['history'] = existing_entry.get('history', [])
        entry['history'].append({
            'value': existing_entry['value'],
            'metadata': existing_entry['metadata'],
            'archivedAt': datetime.now().isoformat()
        })
        long_term_memory['entries'][existing_index] = entry
    else:
        long_term_memory['entries'].append(entry)
    
    save_memory(long_term_memory_path, long_term_memory)
    
    return {
        'success': True,
        'message': f"Stored '{key}' in long-term memory",
        'entry': entry
    }


# Tool definition
tool = {
    'name': 'storeLongTermMemory',
    'description': 'Store information in long-term memory (persistent across sessions)',
    'parameters': {'key': 'string', 'value': 'any', 'metadata': 'object'},
    'execute': execute
}
