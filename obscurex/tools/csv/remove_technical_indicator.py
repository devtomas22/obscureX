"""
Tool: Remove Technical Indicator
Removes a technical indicator from a CSV file
"""

import os
from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Remove a technical indicator from a CSV file."""
    filename = params.get('filename')
    indicator_name = params.get('indicatorName')
    
    if not os.path.exists(filename):
        raise Exception(f"File not found: {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    if not lines:
        raise Exception(f"File is empty: {filename}")
    
    # Find indicator column index
    headers = lines[0].strip().split(',')
    
    try:
        indicator_index = headers.index(indicator_name)
    except ValueError:
        raise Exception(f"Indicator '{indicator_name}' not found in {filename}")
    
    # Remove indicator from header
    headers.pop(indicator_index)
    lines[0] = ','.join(headers) + '\n'
    
    # Remove indicator values from data rows
    for i in range(1, len(lines)):
        values = lines[i].strip().split(',')
        if len(values) > indicator_index:
            values.pop(indicator_index)
            lines[i] = ','.join(values) + '\n'
    
    # Write back to file
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    return {
        'success': True,
        'message': f"Indicator '{indicator_name}' removed from {filename}"
    }


# Tool definition
tool = {
    'name': 'removeTechnicalIndicator',
    'description': 'Remove a technical indicator from a CSV file (works with Binance price data)',
    'parameters': {'filename': 'string', 'indicatorName': 'string'},
    'execute': execute
}
