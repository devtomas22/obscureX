"""
AI Service Layer for Google Gemini
Centralizes all AI-related operations and configuration
"""

import os
import re
import json
from typing import Dict, List, Optional, Any
import google.generativeai as genai


class AIService:
    """AI Service for Google Gemini API integration."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI Service with Google Gemini.
        
        Args:
            api_key: Google API key (optional, will check env vars if not provided)
        """
        self.client = None
        self.model = None
        self.model_name = 'gemini-2.0-flash-exp'
        
        # Get API key from parameter or environment variables
        key = api_key or os.environ.get('GOOGLE_API_KEY') or os.environ.get('GEMINI_API_KEY')
        
        if key:
            genai.configure(api_key=key)
            self.model = genai.GenerativeModel(self.model_name)
            self.client = True  # Mark as configured
    
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
        Create a message using Gemini.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            system: Optional system prompt
            max_tokens: Maximum tokens to generate
            
        Returns:
            Response dict with content array
        """
        if not self.model:
            raise Exception('AI (Google Gemini API) is required. Please provide an API key.')
        
        # Convert messages format to Gemini format
        conversation_history = []
        full_prompt = ''
        
        # Add system prompt as context if provided
        if system:
            full_prompt = f"{system}\n\n"
        
        # Combine messages into a single prompt
        for msg in messages:
            if msg['role'] == 'user':
                full_prompt += msg['content'] + '\n'
            elif msg['role'] == 'assistant':
                # For multi-turn conversations, use chat
                if full_prompt.strip():
                    conversation_history.append({
                        'role': 'user',
                        'parts': [full_prompt.strip()]
                    })
                conversation_history.append({
                    'role': 'model',
                    'parts': [msg['content']]
                })
                full_prompt = f"{system}\n\n" if system else ''
        
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.7,
        )
        
        # Use chat if we have conversation history
        if conversation_history:
            chat = self.model.start_chat(history=conversation_history)
            result = chat.send_message(full_prompt, generation_config=generation_config)
            return {
                'content': [{'text': result.text}]
            }
        else:
            # Single turn generation
            result = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            return {
                'content': [{'text': result.text}]
            }
    
    async def generate_code(
        self, 
        prompt: str, 
        system_prompt: str, 
        max_tokens: int = 4096
    ) -> str:
        """
        Generate code using Gemini.
        
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
