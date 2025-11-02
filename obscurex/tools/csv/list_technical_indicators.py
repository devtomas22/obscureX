"""
Tool: List Technical Indicators
Lists all technical indicators (non-standard columns) in a CSV file
Works with Binance CSV format and other price data formats
"""

import os
from typing import Dict, Any, List


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> List[str]:
    """List technical indicators in a CSV file."""
    filename = params.get('filename')
    
    if not os.path.exists(filename):
        raise Exception(f"File not found: {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.strip().split('\n')
    
    if not lines:
        return []
    
    headers = [h.strip() for h in lines[0].split(',')]
    
    # Filter out standard OHLCV columns and Binance-specific columns
    standard_columns = [
        'date', 'time', 'timestamp', 'open', 'high', 'low', 'close', 'volume',
        'open_time', 'close_time', 'quote_asset_volume', 'quote_volume',
        'number_of_trades', 'num_trades', 'trades',
        'taker_buy_base_asset_volume', 'taker_buy_volume',
        'taker_buy_quote_asset_volume', 'taker_buy_quote_volume',
        'ignore', 'symbol', 'interval'
    ]
    
    indicators = [h for h in headers if h.lower() not in standard_columns]
    
    return indicators


# Tool definition
tool = {
    'name': 'listTechnicalIndicators',
    'description': 'List technical indicators added to a CSV file (works with Binance price data)',
    'parameters': {'filename': 'string'},
    'execute': execute
}
