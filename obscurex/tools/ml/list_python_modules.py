"""
Tool: List Python Modules
Lists all installed Python packages
"""

import subprocess
from typing import Dict, Any, List


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> List[str]:
    """List all installed Python packages."""
    try:
        output = subprocess.run(
            ['pip3', 'list', '--format=freeze'],
            capture_output=True,
            text=True,
            timeout=30,
            check=True
        )
        
        # Parse the output to get module names
        modules = []
        for line in output.stdout.strip().split('\n'):
            parts = line.split('==')
            if parts[0]:
                modules.append(parts[0])
        
        return modules
    except subprocess.TimeoutExpired:
        raise Exception("Failed to list Python modules: Command timed out")
    except subprocess.CalledProcessError as e:
        raise Exception(f"Failed to list Python modules: {e.stderr}")
    except Exception as e:
        raise Exception(f"Failed to list Python modules: {str(e)}")


# Tool definition
tool = {
    'name': 'listPythonModules',
    'description': 'List all installed Python packages',
    'parameters': {},
    'execute': execute
}
