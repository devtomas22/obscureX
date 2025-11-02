"""
Tool: Add Technical Indicator
Adds a technical indicator column to a CSV file
"""

import os
from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Add a technical indicator to a CSV file."""
    filename = params.get('filename')
    indicator_name = params.get('indicatorName')
    
    if not os.path.exists(filename):
        raise Exception(f"File not found: {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    if not lines:
        raise Exception(f"File is empty: {filename}")
    
    # Add indicator to header
    header = lines[0].strip()
    if indicator_name in header.split(','):
        raise Exception(f"Indicator '{indicator_name}' already exists in {filename}")
    
    lines[0] = header + f',{indicator_name}\n'
    
    # Add placeholder values (0) for existing rows
    for i in range(1, len(lines)):
        lines[i] = lines[i].strip() + ',0\n'
    
    # Write back to file
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    return {
        'success': True,
        'message': f"Indicator '{indicator_name}' added to {filename}"
    }


# Tool definition
tool = {
    'name': 'addTechnicalIndicator',
    'description': 'Add a technical indicator column to a CSV file (works with Binance price data)',
    'parameters': {'filename': 'string', 'indicatorName': 'string'},
    'execute': execute
}
