"""
Tool: Install Python Module
Installs a Python package using pip
"""

import subprocess
from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Install a Python package using pip."""
    module_name = params.get('moduleName')
    
    try:
        output = subprocess.run(
            ['pip3', 'install', module_name],
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes
            check=True
        )
        
        return {
            'success': True,
            'message': f"Successfully installed '{module_name}'",
            'output': output.stdout
        }
    except subprocess.TimeoutExpired:
        raise Exception(f"Installation of '{module_name}' timed out")
    except subprocess.CalledProcessError as e:
        raise Exception(f"Failed to install '{module_name}': {e.stderr}")
    except Exception as e:
        raise Exception(f"Failed to install '{module_name}': {str(e)}")


# Tool definition
tool = {
    'name': 'installPythonModule',
    'description': 'Install a Python package using pip',
    'parameters': {'moduleName': 'string'},
    'execute': execute
}
