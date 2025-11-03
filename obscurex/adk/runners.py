"""
Runner implementation following Google ADK interface
"""

from typing import Dict, Any, Optional
from .agents import LlmAgent
from .sessions import InMemorySessionService


class Runner:
    """
    Runner for executing agent queries with session management.
    
    Follows Google ADK-style interface for agent execution.
    """
    
    def __init__(
        self,
        agent: LlmAgent,
        session_service: Optional[InMemorySessionService] = None
    ):
        """
        Initialize the Runner.
        
        Args:
            agent: LlmAgent instance
            session_service: Session service (uses InMemorySessionService if not provided)
        """
        self.agent = agent
        self.session_service = session_service or InMemorySessionService()
    
    def query_sync(
        self,
        prompt: str,
        user_id: str,
        session_id: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 1.0
    ) -> Dict[str, Any]:
        """
        Execute a synchronous query to the agent.
        
        Args:
            prompt: User prompt
            user_id: User identifier
            session_id: Optional session identifier (creates new if not provided)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            
        Returns:
            Response dictionary with text and metadata
        """
        # Create or get session
        if session_id is None:
            session_id = self.session_service.create_session(user_id)
        elif not self.session_service.get_session(session_id):
            session_id = self.session_service.create_session(user_id, session_id)
        
        # Add user message to session
        self.session_service.add_message(session_id, "user", prompt)
        
        # Generate response
        response = self.agent.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            user_id=user_id
        )
        
        # Add assistant response to session
        self.session_service.add_message(session_id, "assistant", response.get("text", ""))
        
        # Update session metadata
        self.session_service.update_session(session_id, {
            "last_prompt": prompt,
            "last_response": response
        })
        
        return {
            "session_id": session_id,
            "response": response.get("text", ""),
            "tool_calls": response.get("tool_calls", []),
            "metadata": {
                "model": response.get("model"),
                "usage": response.get("usage")
            }
        }
    
    async def query_async(
        self,
        prompt: str,
        user_id: str,
        session_id: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 1.0
    ) -> Dict[str, Any]:
        """
        Execute an asynchronous query to the agent.
        
        Args:
            prompt: User prompt
            user_id: User identifier
            session_id: Optional session identifier
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            
        Returns:
            Response dictionary with text and metadata
        """
        # For now, just call sync version
        # In a real implementation, this would use async Anthropic client
        return self.query_sync(
            prompt=prompt,
            user_id=user_id,
            session_id=session_id,
            max_tokens=max_tokens,
            temperature=temperature
        )
    
    def get_session_history(self, session_id: str) -> list:
        """
        Get message history for a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            List of messages
        """
        return self.session_service.get_messages(session_id)
    
    def clear_session(self, session_id: str):
        """
        Clear session history.
        
        Args:
            session_id: Session identifier
        """
        self.session_service.clear_messages(session_id)
