"""
Session Service implementation following Google ADK interface
"""

from typing import Dict, Any, Optional
from datetime import datetime
import json


class InMemorySessionService:
    """
    In-memory session service for storing session data.
    
    Follows Google ADK-style interface for session management.
    """
    
    def __init__(self):
        """Initialize the in-memory session service."""
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, user_id: str, session_id: Optional[str] = None) -> str:
        """
        Create a new session.
        
        Args:
            user_id: User identifier
            session_id: Optional session identifier (auto-generated if not provided)
            
        Returns:
            Session ID
        """
        if session_id is None:
            from secrets import token_hex
            timestamp = int(datetime.now().timestamp() * 1000)
            session_id = f"session_{user_id}_{timestamp}_{token_hex(4)}"
        
        self.sessions[session_id] = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "messages": [],
            "metadata": {}
        }
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session data.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session data or None if not found
        """
        return self.sessions.get(session_id)
    
    def update_session(self, session_id: str, data: Dict[str, Any]):
        """
        Update session data.
        
        Args:
            session_id: Session identifier
            data: Data to update
        """
        if session_id in self.sessions:
            self.sessions[session_id].update(data)
            self.sessions[session_id]["updated_at"] = datetime.now().isoformat()
    
    def delete_session(self, session_id: str):
        """
        Delete a session.
        
        Args:
            session_id: Session identifier
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def add_message(self, session_id: str, role: str, content: str):
        """
        Add a message to session history.
        
        Args:
            session_id: Session identifier
            role: Message role (user, assistant, system)
            content: Message content
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        self.sessions[session_id]["messages"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
    
    def get_messages(self, session_id: str) -> list:
        """
        Get message history for a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            List of messages
        """
        if session_id not in self.sessions:
            return []
        
        return self.sessions[session_id].get("messages", [])
    
    def clear_messages(self, session_id: str):
        """
        Clear message history for a session.
        
        Args:
            session_id: Session identifier
        """
        if session_id in self.sessions:
            self.sessions[session_id]["messages"] = []
