#!/usr/bin/env python3
"""
Example usage of ObscureX AI Agent in Python
"""

import asyncio
import sys
from obscurex import ObscureXAgent


async def run_examples():
    """Run example usage of the ObscureX Agent."""
    print('=== ObscureX AI Agent Examples (Python) ===\n')
    
    # Create agent
    agent = ObscureXAgent()
    
    # Example 1: List all available tools
    print('Example 1: List all available tools')
    print('-----------------------------------')
    tools = await agent.list_tools()
    for tool in tools:
        print(f"- {tool['name']}: {tool['description']}")
    print()
    
    # Example 2: Test memory operations
    print('Example 2: Memory operations')
    print('----------------------------')
    
    # Store in memory
    result = await agent.execute_tool('storeMemory', {
        'key': 'test_key',
        'value': {'data': 'test_value'},
        'metadata': {'type': 'example'}
    })
    print(f"Store result: {result['result']['message']}")
    
    # Retrieve from memory
    result = await agent.execute_tool('retrieveMemory', {
        'key': 'test_key'
    })
    print(f"Retrieved value: {result['result']['value']}")
    
    # Search memory
    result = await agent.execute_tool('searchMemory', {
        'query': 'test'
    })
    print(f"Search found {result['result']['count']} entries")
    print()
    
    # Example 3: List Python modules
    print('Example 3: List Python modules')
    print('-------------------------------')
    result = await agent.execute_tool('listPythonModules', {})
    if result['success']:
        modules = result['result']
        print(f"Found {len(modules)} Python modules")
        print(f"First 10 modules: {modules[:10]}")
    print()
    
    # Example 4: Test CSV operations (create sample file)
    print('Example 4: CSV operations')
    print('-------------------------')
    
    # Create sample CSV file
    sample_csv = """date,open,high,low,close,volume
2024-01-01,100,105,99,103,1000
2024-01-02,103,108,102,107,1200
2024-01-03,107,110,106,109,1100"""
    
    with open('sample_data.csv', 'w') as f:
        f.write(sample_csv)
    print('Created sample_data.csv')
    
    # List indicators (should be empty initially)
    result = await agent.execute_tool('listTechnicalIndicators', {
        'filename': 'sample_data.csv'
    })
    print(f"Initial indicators: {result['result']}")
    
    # Add indicator
    result = await agent.execute_tool('addTechnicalIndicator', {
        'filename': 'sample_data.csv',
        'indicatorName': 'SMA_20'
    })
    print(f"Add indicator: {result['result']['message']}")
    
    # List again
    result = await agent.execute_tool('listTechnicalIndicators', {
        'filename': 'sample_data.csv'
    })
    print(f"After adding: {result['result']}")
    
    # Remove indicator
    result = await agent.execute_tool('removeTechnicalIndicator', {
        'filename': 'sample_data.csv',
        'indicatorName': 'SMA_20'
    })
    print(f"Remove indicator: {result['result']['message']}")
    print()
    
    print('✓ All examples completed successfully!')
    print('\nNote: AI-powered features require ANTHROPIC_API_KEY or CLAUDE_API_KEY')
    print('      Set the environment variable to test AI features.')


if __name__ == '__main__':
    try:
        asyncio.run(run_examples())
    except KeyboardInterrupt:
        print('\nInterrupted by user')
        sys.exit(0)
    except Exception as e:
        print(f'\nError: {e}')
        sys.exit(1)
