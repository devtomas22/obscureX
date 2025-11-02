"""
AI Service Layer for Anthropic Claude
Centralizes all AI-related operations and configuration
"""

import os
import re
import json
from typing import Dict, List, Optional, Any
from anthropic import Anthropic


class AIService:
    """AI Service for Anthropic Claude API integration."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI Service with Anthropic Claude.
        
        Args:
            api_key: Anthropic API key (optional, will check env vars if not provided)
        """
        self.client = None
        self.model = None
        self.model_name = 'claude-3-5-sonnet-20241022'
        
        # Get API key from parameter or environment variables
        key = api_key or os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('CLAUDE_API_KEY')
        
        if key:
            self.client = Anthropic(api_key=key)
            self.model = self.model_name
    
    def is_available(self) -> bool:
        """Check if AI service is available."""
        return self.client is not None and self.model is not None
    
    def get_model_name(self) -> str:
        """Get the configured model name."""
        return self.model_name
    
    async def create_message(
        self, 
        messages: List[Dict[str, str]], 
        system: Optional[str] = None, 
        max_tokens: int = 1024
    ) -> Dict[str, Any]:
        """
        Create a message using Claude.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            system: Optional system prompt
            max_tokens: Maximum tokens to generate
            
        Returns:
            Response dict with content array
        """
        if not self.client:
            raise Exception('AI (Anthropic Claude API) is required. Please provide an API key.')
        
        # Convert messages format to Claude format
        claude_messages = []
        for msg in messages:
            role = msg['role']
            # Claude uses 'assistant' instead of 'model'
            if role == 'model':
                role = 'assistant'
            claude_messages.append({
                'role': role,
                'content': msg['content']
            })
        
        # Call Claude API
        response = self.client.messages.create(
            model=self.model_name,
            max_tokens=max_tokens,
            system=system if system else None,
            messages=claude_messages
        )
        
        # Convert response to expected format
        return {
            'content': [{'text': response.content[0].text}]
        }
    
    async def generate_code(
        self, 
        prompt: str, 
        system_prompt: str, 
        max_tokens: int = 4096
    ) -> str:
        """
        Generate code using Claude.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            max_tokens: Maximum tokens
            
        Returns:
            Generated code string
        """
        message = await self.create_message(
            messages=[{'role': 'user', 'content': prompt}],
            system=system_prompt,
            max_tokens=max_tokens
        )
        
        code = message['content'][0]['text']
        # Clean up markdown code blocks
        code = re.sub(r'```python\n?', '', code)
        code = re.sub(r'```\n?', '', code)
        return code.strip()
    
    async def analyze_and_decide(
        self, 
        prompt: str, 
        system_prompt: str, 
        max_tokens: int = 1024
    ) -> Dict[str, Any]:
        """
        Analyze context and make decisions.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            max_tokens: Maximum tokens
            
        Returns:
            Decision object (parsed JSON or dict with response text)
        """
        message = await self.create_message(
            messages=[{'role': 'user', 'content': prompt}],
            system=system_prompt,
            max_tokens=max_tokens
        )
        
        response_text = message['content'][0]['text']
        
        # Try to parse JSON response
        try:
            # Extract JSON from markdown code blocks if present
            json_text = response_text
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_text = json_match.group(1)
            else:
                code_match = re.search(r'```\s*([\s\S]*?)\s*```', response_text)
                if code_match:
                    json_text = code_match.group(1)
            
            return json.loads(json_text)
        except (json.JSONDecodeError, AttributeError):
            # Return text response if JSON parsing fails
            return {
                'response': response_text,
                'parsed': False
            }
    
    async def generate_text(
        self, 
        prompt: str, 
        system_prompt: str, 
        max_tokens: int = 1024
    ) -> str:
        """
        Generate text response.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            max_tokens: Maximum tokens
            
        Returns:
            Generated text string
        """
        message = await self.create_message(
            messages=[{'role': 'user', 'content': prompt}],
            system=system_prompt,
            max_tokens=max_tokens
        )
        
        return message['content'][0]['text'].strip()
