"""
Tool: Analyze Binance Data
Analyzes Binance price data and provides statistics
"""

import os
import pandas as pd
from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Analyze Binance price data and provide statistics."""
    filename = params.get('filename')
    
    if not os.path.exists(filename):
        raise Exception(f"File not found: {filename}")
    
    # Read CSV file
    df = pd.read_csv(filename)
    
    # Calculate statistics
    stats = {
        'price': {
            'min': float(df['low'].min()),
            'max': float(df['high'].max()),
            'average': float(df['close'].mean()),
            'current': float(df['close'].iloc[-1]),
            'start': float(df['close'].iloc[0]),
            'change': float(df['close'].iloc[-1] - df['close'].iloc[0]),
            'changePercent': float((df['close'].iloc[-1] - df['close'].iloc[0]) / df['close'].iloc[0] * 100)
        },
        'volume': {
            'total': float(df['volume'].sum()),
            'average': float(df['volume'].mean()),
            'min': float(df['volume'].min()),
            'max': float(df['volume'].max())
        },
        'volatility': {
            'standardDeviation': float(df['close'].std()),
            'volatilityPercent': float((df['close'].std() / df['close'].mean()) * 100),
            'averageReturn': float(df['close'].pct_change().mean() * 100)
        },
        'trends': {
            'shortTerm': 'bullish' if df['close'].iloc[-1] > df['close'].iloc[-10:].mean() else 'bearish',
            'overall': 'bullish' if df['close'].iloc[-1] > df['close'].iloc[0] else 'bearish'
        }
    }
    
    return stats


# Tool definition
tool = {
    'name': 'analyzeBinanceData',
    'description': 'Analyze Binance price data and provide statistics (volatility, trends, volume analysis)',
    'parameters': {'filename': 'string'},
    'execute': execute
}
