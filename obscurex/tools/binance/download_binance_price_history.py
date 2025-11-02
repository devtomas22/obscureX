"""
Tool: Download Binance Price History
Downloads historical price data from Binance API
"""

import requests
from datetime import datetime
from typing import Dict, Any, Optional, List


def _parse_time(time_str: str) -> int:
    """Parse time string to millisecond timestamp."""
    try:
        # If it's already a number, return it
        return int(time_str)
    except ValueError:
        # Try to parse as ISO date
        dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
        return int(dt.timestamp() * 1000)


def _convert_to_csv(data: List) -> str:
    """Convert Binance kline data to CSV format."""
    # CSV header
    csv = "timestamp,open,high,low,close,volume,close_time,quote_volume,trades,taker_buy_volume,taker_buy_quote_volume\n"
    
    for candle in data:
        # Binance klines format: 
        # [open_time, open, high, low, close, volume, close_time, quote_asset_volume, 
        #  number_of_trades, taker_buy_base_volume, taker_buy_quote_volume, ignore]
        csv += f"{candle[0]},{candle[1]},{candle[2]},{candle[3]},{candle[4]},{candle[5]},"
        csv += f"{candle[6]},{candle[7]},{candle[8]},{candle[9]},{candle[10]}\n"
    
    return csv


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Download historical price data from Binance."""
    symbol = params.get('symbol')
    interval = params.get('interval')
    start_time = params.get('startTime')
    end_time = params.get('endTime')
    limit = params.get('limit', 1000)
    output_file = params.get('outputFile')
    
    try:
        # Validate parameters
        valid_intervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M']
        if interval not in valid_intervals:
            raise Exception(f"Invalid interval. Must be one of: {', '.join(valid_intervals)}")
        
        if limit > 1000:
            raise Exception('Limit cannot exceed 1000 per request')
        
        # Build API URL
        url = f"https://api.binance.com/api/v3/klines?symbol={symbol.upper()}&interval={interval}&limit={limit}"
        
        if start_time:
            start_ms = _parse_time(start_time)
            url += f"&startTime={start_ms}"
        
        if end_time:
            end_ms = _parse_time(end_time)
            url += f"&endTime={end_ms}"
        
        print(f"Downloading {symbol} data from Binance ({interval} interval)...")
        
        # Fetch data from Binance API
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if not data or len(data) == 0:
            raise Exception('No data received from Binance API')
        
        # Convert to CSV format
        csv = _convert_to_csv(data)
        
        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(csv)
        
        print(f"✓ Downloaded {len(data)} candles to {output_file}")
        
        return {
            'success': True,
            'symbol': symbol,
            'interval': interval,
            'records': len(data),
            'filename': output_file,
            'startDate': datetime.fromtimestamp(data[0][0] / 1000).isoformat(),
            'endDate': datetime.fromtimestamp(data[-1][0] / 1000).isoformat(),
            'message': f"Downloaded {len(data)} {interval} candles for {symbol}"
        }
    except requests.RequestException as e:
        raise Exception(f"Failed to download Binance data: {str(e)}")
    except Exception as e:
        raise Exception(f"Error downloading Binance data: {str(e)}")


# Tool definition
tool = {
    'name': 'downloadBinancePriceHistory',
    'description': 'Download historical cryptocurrency price data from Binance in CSV format',
    'parameters': {
        'symbol': 'string',
        'interval': 'string',
        'startTime': 'string|null',
        'endTime': 'string|null',
        'limit': 'number',
        'outputFile': 'string'
    },
    'execute': execute
}
