"""
FastAPI integration for ADK agents
"""

from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .agents import LlmAgent
from .sessions import InMemorySessionService


class QueryRequest(BaseModel):
    """Request model for agent queries."""
    prompt: str
    user_id: str
    session_id: Optional[str] = None
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 1.0


class QueryResponse(BaseModel):
    """Response model for agent queries."""
    session_id: str
    response: str
    tool_calls: list = []
    metadata: Dict[str, Any] = {}


class ADKAgent:
    """
    ADK Agent wrapper for FastAPI integration.
    
    Provides a simple interface for serving agents via FastAPI.
    """
    
    def __init__(
        self,
        agent: LlmAgent,
        app_name: str = "ADK Agent",
        user_id: Optional[str] = None,
        use_in_memory_services: bool = True
    ):
        """
        Initialize ADK Agent wrapper.
        
        Args:
            agent: LlmAgent instance
            app_name: Application name
            user_id: Default user ID
            use_in_memory_services: Use in-memory session service
        """
        self.agent = agent
        self.app_name = app_name
        self.default_user_id = user_id or "default"
        self.session_service = InMemorySessionService() if use_in_memory_services else None
    
    def query(
        self,
        prompt: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 1.0
    ) -> Dict[str, Any]:
        """
        Execute a query to the agent.
        
        Args:
            prompt: User prompt
            user_id: User identifier
            session_id: Optional session identifier
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            
        Returns:
            Response dictionary
        """
        from .runners import Runner
        
        runner = Runner(agent=self.agent, session_service=self.session_service)
        
        return runner.query_sync(
            prompt=prompt,
            user_id=user_id or self.default_user_id,
            session_id=session_id,
            max_tokens=max_tokens,
            temperature=temperature
        )


def add_adk_fastapi_endpoint(
    app: FastAPI,
    adk_agent: ADKAgent,
    path: str = "/"
):
    """
    Add ADK agent endpoint to FastAPI application.
    
    Args:
        app: FastAPI application
        adk_agent: ADKAgent instance
        path: Base path for the endpoint
    """
    
    @app.get(path)
    async def root():
        """Root endpoint."""
        return {
            "app": adk_agent.app_name,
            "agent": adk_agent.agent.name,
            "status": "running"
        }
    
    @app.post(path + "query" if not path.endswith("/") else "query")
    async def query(request: QueryRequest) -> QueryResponse:
        """
        Query the agent.
        
        Args:
            request: Query request
            
        Returns:
            Query response
        """
        try:
            result = adk_agent.query(
                prompt=request.prompt,
                user_id=request.user_id,
                session_id=request.session_id,
                max_tokens=request.max_tokens or 1024,
                temperature=request.temperature or 1.0
            )
            
            return QueryResponse(
                session_id=result["session_id"],
                response=result["response"],
                tool_calls=result.get("tool_calls", []),
                metadata=result.get("metadata", {})
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get(path + "health" if not path.endswith("/") else "health")
    async def health():
        """Health check endpoint."""
        return {"status": "healthy"}
