"""
Tool: Test ML Pipeline
Executes a Python ML pipeline and extracts MSE value
Works with Binance price data CSV format
"""

import os
import re
import subprocess
import tempfile
import secrets
from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Execute a Python ML pipeline and return MSE value."""
    python_code = params.get('pythonCode')
    
    # Create a temporary Python file
    temp_file = os.path.join(
        tempfile.gettempdir(),
        f"ml_pipeline_{secrets.token_hex(8)}.py"
    )
    
    try:
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(python_code)
        
        # Execute the Python script and capture output
        result = subprocess.run(
            ['python3', temp_file],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        output = result.stdout
        
        # Try to extract MSE from output
        mse = None
        mse_match = re.search(r'MSE[:\s=]+([0-9.]+)', output, re.IGNORECASE)
        
        if mse_match:
            mse = float(mse_match.group(1))
        else:
            # Try to parse the last line as a number
            lines = output.strip().split('\n')
            if lines:
                last_line = lines[-1]
                number_match = re.search(r'([0-9.]+)', last_line)
                if number_match:
                    mse = float(number_match.group(1))
        
        message = (f'Pipeline executed successfully. MSE: {mse}' 
                  if mse is not None 
                  else 'Pipeline executed but MSE not found in output')
        
        return {
            'success': True,
            'mse': mse,
            'output': output,
            'message': message
        }
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'mse': None,
            'error': 'Pipeline execution timed out',
            'message': 'Pipeline execution timed out after 5 minutes'
        }
    except Exception as error:
        return {
            'success': False,
            'mse': None,
            'error': str(error),
            'message': f'Pipeline execution failed: {str(error)}'
        }
    finally:
        # Clean up temp file
        try:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
        except:
            pass  # Ignore cleanup errors


# Tool definition
tool = {
    'name': 'testMLPipeline',
    'description': 'Execute a Python ML pipeline for price prediction and return MSE value (works with Binance data)',
    'parameters': {'pythonCode': 'string'},
    'execute': execute
}
