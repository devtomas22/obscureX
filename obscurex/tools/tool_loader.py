"""
Tool Loader
Dynamically loads all tools from the tools directory
"""

import os
import importlib
import inspect
from typing import List, Dict, Any, Optional
from pathlib import Path


async def load_tools() -> List[Dict[str, Any]]:
    """
    Load all tools from the tools directory.
    
    Returns:
        List of tool dictionaries
    """
    tools_base_dir = Path(__file__).parent
    tools = []
    
    # Categories to load
    categories = ['csv', 'ml', 'memory', 'binance', 'analysis', 'autonomy']
    
    for category in categories:
        category_path = tools_base_dir / category
        
        try:
            if not category_path.exists():
                continue
                
            # Get all Python files in the category directory
            for file_path in category_path.glob('*.py'):
                if file_path.name.startswith('__'):
                    continue
                
                # Import the module
                module_name = f"obscurex.tools.{category}.{file_path.stem}"
                try:
                    module = importlib.import_module(module_name)
                    
                    # Get the tool dict/object from the module
                    if hasattr(module, 'tool'):
                        tool = module.tool
                        if isinstance(tool, dict) and 'name' in tool and 'execute' in tool:
                            tools.append({
                                **tool,
                                'category': category,
                                'file': file_path.name
                            })
                except Exception as e:
                    print(f"Warning: Could not load tool from {file_path}: {e}")
                    
        except Exception as e:
            print(f"Warning: Could not load tools from {category}: {e}")
    
    return tools


def get_tool(tools: List[Dict[str, Any]], tool_name: str) -> Optional[Dict[str, Any]]:
    """
    Get tool by name.
    
    Args:
        tools: List of tools
        tool_name: Name of the tool to find
        
    Returns:
        Tool dict or None if not found
    """
    for tool in tools:
        if tool.get('name') == tool_name:
            return tool
    return None


def list_tools(tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    List all tools with metadata.
    
    Args:
        tools: List of tools
        
    Returns:
        List of tool metadata dicts
    """
    return [
        {
            'name': t.get('name'),
            'description': t.get('description'),
            'parameters': t.get('parameters'),
            'category': t.get('category')
        }
        for t in tools
    ]
