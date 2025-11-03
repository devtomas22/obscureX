"""
LLM Agent implementation following Google ADK interface using Anthropic Claude
"""

from typing import List, Optional, Dict, Any
from anthropic import Anthropic
import os


class LlmAgent:
    """
    LLM Agent that follows Google ADK-style interface but uses Anthropic Claude.
    
    This agent can execute tools and generate responses using Claude models.
    """
    
    def __init__(
        self,
        name: str,
        model: str = "claude-3-5-sonnet-20241022",
        instruction: Optional[str] = None,
        tools: Optional[List[Any]] = None,
        api_key: Optional[str] = None
    ):
        """
        Initialize the LLM Agent.
        
        Args:
            name: Name of the agent
            model: Anthropic Claude model name (default: claude-3-5-sonnet-20241022)
            instruction: System instruction/prompt for the agent
            tools: List of FunctionTool objects
            api_key: Anthropic API key (optional, will check env vars)
        """
        self.name = name
        self.model = model
        self.instruction = instruction or f"You are {name}, a helpful AI assistant."
        self.tools = tools or []
        
        # Initialize Anthropic client
        key = api_key or os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('CLAUDE_API_KEY')
        if not key:
            raise ValueError(
                "Anthropic API key is required. "
                "Provide via api_key parameter or set ANTHROPIC_API_KEY environment variable."
            )
        
        self.client = Anthropic(api_key=key)
        
        # Build tool definitions for Claude
        self._tool_definitions = self._build_tool_definitions()
    
    def _build_tool_definitions(self) -> List[Dict[str, Any]]:
        """Build tool definitions in Claude's format."""
        tool_defs = []
        
        for tool in self.tools:
            if hasattr(tool, 'to_claude_format'):
                tool_defs.append(tool.to_claude_format())
        
        return tool_defs
    
    def _execute_tool(self, tool_name: str, tool_input: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Any:
        """Execute a tool by name."""
        for tool in self.tools:
            if tool.name == tool_name:
                return tool.execute(tool_input, context)
        
        raise ValueError(f"Tool '{tool_name}' not found")
    
    def generate(
        self,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 1.0,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a response from the agent.
        
        Args:
            prompt: User prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            user_id: Optional user identifier
            
        Returns:
            Dictionary with response text and metadata
        """
        messages = [{"role": "user", "content": prompt}]
        
        # Call Claude API
        if self._tool_definitions:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=self.instruction,
                messages=messages,
                tools=self._tool_definitions
            )
        else:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=self.instruction,
                messages=messages
            )
        
        # Handle tool use
        if response.stop_reason == "tool_use":
            tool_results = []
            for content_block in response.content:
                if content_block.type == "tool_use":
                    tool_name = content_block.name
                    tool_input = content_block.input
                    
                    # Execute the tool
                    try:
                        result = self._execute_tool(tool_name, tool_input)
                        tool_results.append({
                            "tool_name": tool_name,
                            "result": result
                        })
                    except Exception as e:
                        tool_results.append({
                            "tool_name": tool_name,
                            "error": str(e)
                        })
            
            # Continue conversation with tool results
            messages.append({"role": "assistant", "content": response.content})
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(tool_results[i]["result"]) if "result" in tool_results[i] else tool_results[i]["error"]
                    }
                    for i, block in enumerate([b for b in response.content if b.type == "tool_use"])
                ]
            })
            
            # Get final response
            final_response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=self.instruction,
                messages=messages
            )
            
            return {
                "text": final_response.content[0].text if final_response.content else "",
                "tool_calls": tool_results,
                "model": self.model,
                "usage": {
                    "input_tokens": final_response.usage.input_tokens,
                    "output_tokens": final_response.usage.output_tokens
                }
            }
        
        # Return text response
        return {
            "text": response.content[0].text if response.content else "",
            "model": self.model,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens
            }
        }
