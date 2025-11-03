"""
Function Tool implementation following Google ADK interface
"""

from typing import Callable, Dict, Any, Optional, List


class FunctionTool:
    """
    Function Tool that wraps a Python function for use with the LLM Agent.
    
    Follows Google ADK-style interface for tool definition.
    """
    
    def __init__(
        self,
        name: str,
        func: Callable,
        description: str,
        parameters: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a Function Tool.
        
        Args:
            name: Name of the tool
            func: Python function to execute
            description: Description of what the tool does
            parameters: Optional parameter schema in JSON Schema format
        """
        self.name = name
        self.func = func
        self.description = description
        self.parameters = parameters or self._infer_parameters()
    
    def _infer_parameters(self) -> Dict[str, Any]:
        """
        Infer parameter schema from function signature.
        
        Returns:
            JSON Schema for parameters
        """
        import inspect
        
        sig = inspect.signature(self.func)
        properties = {}
        required = []
        
        for param_name, param in sig.parameters.items():
            # Skip context parameter
            if param_name == 'context':
                continue
            
            # Default to string type
            param_type = "string"
            
            # Check annotation for type hints
            if param.annotation != inspect.Parameter.empty:
                annotation = param.annotation
                if annotation in (int, float):
                    param_type = "number"
                elif annotation == bool:
                    param_type = "boolean"
                elif annotation in (list, List):
                    param_type = "array"
                elif annotation in (dict, Dict):
                    param_type = "object"
            
            properties[param_name] = {
                "type": param_type,
                "description": f"Parameter {param_name}"
            }
            
            # Add to required if no default value
            if param.default == inspect.Parameter.empty:
                required.append(param_name)
        
        return {
            "type": "object",
            "properties": properties,
            "required": required
        }
    
    def to_claude_format(self) -> Dict[str, Any]:
        """
        Convert tool definition to Claude's format.
        
        Returns:
            Tool definition in Claude's format
        """
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.parameters
        }
    
    def execute(self, tool_input: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Any:
        """
        Execute the tool function.
        
        Args:
            tool_input: Input parameters for the tool
            context: Optional context dictionary
            
        Returns:
            Result from the function
        """
        import inspect
        
        sig = inspect.signature(self.func)
        
        # Check if function accepts context
        if 'context' in sig.parameters:
            return self.func(context, **tool_input)
        else:
            return self.func(**tool_input)
