#!/usr/bin/env python3
"""
FastAPI server example using ADK-style agent with Anthropic Claude

This demonstrates how to serve an ADK agent via FastAPI for integration with frontend apps.
Run with: python adk_fastapi_example.py
Then test with: curl -X POST http://localhost:8000/query -H "Content-Type: application/json" -d '{"prompt":"Hello!", "user_id":"test"}'
"""

import os
from fastapi import FastAPI
from obscurex.adk import LlmAgent, FunctionTool, ADKAgent, add_adk_fastapi_endpoint


# Define tools
def echo_tool(context, message: str) -> str:
    """Repeats the user's message."""
    return f"Echo: {message}"


def get_info_tool(context, topic: str) -> str:
    """Gets information about a topic."""
    # Mock implementation
    info_db = {
        "python": "Python is a high-level, interpreted programming language known for its simplicity and readability.",
        "fastapi": "FastAPI is a modern, fast web framework for building APIs with Python based on standard Python type hints.",
        "anthropic": "Anthropic is an AI safety company that created Claude, a helpful, harmless, and honest AI assistant.",
        "adk": "Google ADK (Agent Development Kit) is a toolkit for developing AI agents, adapted here for Anthropic Claude."
    }
    return info_db.get(topic.lower(), f"No information available for topic: {topic}")


# Create tool declarations
echo_tool_decl = FunctionTool(
    name="echo",
    func=echo_tool,
    description="Repeats a message",
    parameters={
        "type": "object",
        "properties": {
            "message": {"type": "string", "description": "The message to echo"}
        },
        "required": ["message"]
    }
)

info_tool_decl = FunctionTool(
    name="get_info",
    func=get_info_tool,
    description="Gets information about a specific topic",
    parameters={
        "type": "object",
        "properties": {
            "topic": {"type": "string", "description": "The topic to get information about"}
        },
        "required": ["topic"]
    }
)


def create_app():
    """Create and configure FastAPI application."""
    # Get API key
    api_key = os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('CLAUDE_API_KEY')
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable is required. "
            "Get your key at: https://console.anthropic.com/"
        )
    
    # Create agent
    agent = LlmAgent(
        name="FastAPIAgent",
        model="claude-3-5-sonnet-20241022",  # Using Anthropic Claude
        instruction="You are a helpful API assistant. Use tools when appropriate to help users.",
        tools=[echo_tool_decl, info_tool_decl],
        api_key=api_key
    )
    
    # Wrap agent for FastAPI
    adk_agent = ADKAgent(
        agent=agent,
        app_name="ADK Agent Demo",
        user_id="demo_user",
        use_in_memory_services=True
    )
    
    # Create FastAPI app
    app = FastAPI(title="ADK Agent Demo", version="1.0.0")
    
    # Add ADK endpoint
    add_adk_fastapi_endpoint(app, adk_agent, path="/")
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("ADK Agent FastAPI Server")
    print("=" * 60)
    print("\nStarting server on http://0.0.0.0:8000")
    print("\nEndpoints:")
    print("  GET  /          - Root endpoint")
    print("  POST /query     - Query the agent")
    print("  GET  /health    - Health check")
    print("\nExample usage:")
    print('  curl -X POST http://localhost:8000/query \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"prompt":"Hello, agent!", "user_id":"test"}\'')
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    print()
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
