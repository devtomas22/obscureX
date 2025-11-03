# Google ADK Integration with Anthropic Claude

This implementation provides a Google ADK (Agent Development Kit) style interface for ObscureX, using **Anthropic Claude** instead of Google's Gemini models.

## Overview

Google ADK is an open-source, code-first toolkit built by Google for developing, evaluating, and deploying sophisticated AI agents. This implementation adapts the ADK interface to work with Anthropic's Claude models, providing the same developer experience while leveraging Claude's capabilities.

## Core Features

- **Pre-built & Custom Tools**: Integrate both built-in and user-defined tools through `FunctionTool`
- **Code-First Workflow**: Agents and tools defined in Python for flexibility
- **Multi-Agent Design**: Compose applications from multiple cooperating agents
- **Flexible Deployment**: Supports FastAPI/ASGI for web deployment
- **Session Management**: Built-in session service for conversation history
- **Anthropic Claude Models**: Uses Claude 3.5 Sonnet by default (not Gemini)

## Installation

```bash
cd /path/to/obscureX
pip install -r requirements.txt
```

Required dependencies:
- `anthropic>=0.72.0` - For Claude API access
- `fastapi>=0.104.0` - For web service integration
- `uvicorn>=0.24.0` - ASGI server
- `pydantic>=2.0.0` - Data validation

## Quick Start

### Minimum Working Example

```python
# Import core ADK components
from obscurex.adk import LlmAgent, FunctionTool, InMemorySessionService, Runner

# Define a tool as a standard Python function
def echo_tool(context, message: str) -> str:
    return f"Echo: {message}"

echo_tool_decl = FunctionTool(
    name="echo_tool",
    func=echo_tool,
    description="Repeats the user's message"
)

# Instantiate an agent bound to Claude (not Gemini)
agent = LlmAgent(
    name="EchoAgent",
    model="claude-3-5-sonnet-20241022",  # Using Anthropic Claude
    instruction="Repeat what the user says.",
    tools=[echo_tool_decl]
)

# Run agent in a local Python context
runner = Runner(agent=agent, session_service=InMemorySessionService())

response = runner.query_sync(
    prompt="Say hello, agent!",
    user_id="demo"
)
print(response)
```

### Environment Setup

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
# or
export CLAUDE_API_KEY='your-api-key-here'
```

Get your key at: https://console.anthropic.com/

## API Reference

### LlmAgent

Main agent class that uses Anthropic Claude for generation.

```python
agent = LlmAgent(
    name="MyAgent",
    model="claude-3-5-sonnet-20241022",  # Claude model name
    instruction="You are a helpful assistant.",
    tools=[tool1, tool2],  # Optional list of FunctionTool objects
    api_key="your-api-key"  # Optional, uses env vars if not provided
)
```

**Parameters:**
- `name` (str): Agent name
- `model` (str): Claude model identifier
- `instruction` (str): System prompt/instruction for the agent
- `tools` (List[FunctionTool]): List of tools the agent can use
- `api_key` (str, optional): Anthropic API key

### FunctionTool

Wraps a Python function to make it available to the agent.

```python
def my_function(context, param1: str, param2: int) -> str:
    return f"Processed: {param1} x {param2}"

tool = FunctionTool(
    name="my_tool",
    func=my_function,
    description="Description of what the tool does",
    parameters={  # Optional, auto-inferred if not provided
        "type": "object",
        "properties": {
            "param1": {"type": "string", "description": "First parameter"},
            "param2": {"type": "number", "description": "Second parameter"}
        },
        "required": ["param1", "param2"]
    }
)
```

**Parameters:**
- `name` (str): Tool name
- `func` (Callable): Python function to execute
- `description` (str): What the tool does
- `parameters` (dict, optional): JSON Schema for parameters (auto-inferred if not provided)

### InMemorySessionService

Manages conversation sessions and history.

```python
service = InMemorySessionService()

# Create a session
session_id = service.create_session(user_id="user123")

# Add messages
service.add_message(session_id, "user", "Hello")
service.add_message(session_id, "assistant", "Hi there!")

# Retrieve messages
messages = service.get_messages(session_id)

# Clear session
service.clear_messages(session_id)
```

### Runner

Executes agent queries with session management.

```python
runner = Runner(
    agent=agent,
    session_service=InMemorySessionService()
)

# Synchronous query
response = runner.query_sync(
    prompt="Your question here",
    user_id="user123",
    session_id="optional-session-id",  # Auto-created if not provided
    max_tokens=1024,
    temperature=1.0
)

# Response structure:
# {
#     "session_id": "session_...",
#     "response": "Agent's text response",
#     "tool_calls": [...],  # Tools that were executed
#     "metadata": {"model": "...", "usage": {...}}
# }
```

## FastAPI Integration

Serve agents via HTTP endpoints for frontend integration.

```python
from fastapi import FastAPI
from obscurex.adk import LlmAgent, FunctionTool, ADKAgent, add_adk_fastapi_endpoint

# Create agent with tools
agent = LlmAgent(
    name="APIAgent",
    model="claude-3-5-sonnet-20241022",
    instruction="You are a helpful API assistant.",
    tools=[...]
)

# Wrap for FastAPI
adk_agent = ADKAgent(
    agent=agent,
    app_name="demo",
    user_id="default",
    use_in_memory_services=True
)

# Create FastAPI app
app = FastAPI(title="ADK Agent Demo")
add_adk_fastapi_endpoint(app, adk_agent, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Endpoints:**
- `GET /` - Root endpoint (status)
- `POST /query` - Query the agent
- `GET /health` - Health check

**Example Request:**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!", "user_id": "test", "max_tokens": 1024}'
```

## Examples

### Running the Demo Agent

```bash
# Set your API key
export ANTHROPIC_API_KEY='your-api-key'

# Run the example
python adk_agent_example.py
```

The demo includes:
- Echo tool - Repeats messages
- Calculator - Basic arithmetic
- Weather tool - Mock weather information

### Running the FastAPI Server

```bash
# Set your API key
export ANTHROPIC_API_KEY='your-api-key'

# Start the server
python adk_fastapi_example.py

# In another terminal, test it:
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is 10 + 5?", "user_id":"test"}'
```

## Testing

Run the structure tests:

```bash
python test_adk.py
```

This tests all components without requiring an API key.

## Architecture

```
obscurex/adk/
├── __init__.py                 # Main exports
├── agents.py                   # LlmAgent class
├── tools.py                    # FunctionTool class
├── sessions.py                 # InMemorySessionService
├── runners.py                  # Runner class
└── fastapi_integration.py      # FastAPI support
```

## Key Differences from Google ADK

1. **Model Provider**: Uses Anthropic Claude instead of Google Gemini
2. **API Integration**: Built on Anthropic's Python SDK
3. **Tool Format**: Converts tools to Claude's format internally
4. **Authentication**: Uses ANTHROPIC_API_KEY instead of Google credentials

## Supported Claude Models

- `claude-3-5-sonnet-20241022` (default) - Most capable
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-haiku-20240307` - Fast and efficient
- `claude-3-opus-20240229` - Highest capability

## Advanced Usage

### Custom Tool with Complex Logic

```python
def database_query_tool(context, query: str, table: str) -> str:
    """Execute a database query."""
    # Access context for session info, memory, etc.
    session_id = context.get('session_id') if context else None
    
    # Your database logic here
    result = f"Querying {table} with: {query}"
    
    return result

db_tool = FunctionTool(
    name="database_query",
    func=database_query_tool,
    description="Executes database queries safely",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "SQL query to execute"},
            "table": {"type": "string", "description": "Table name"}
        },
        "required": ["query", "table"]
    }
)
```

### Session Management

```python
runner = Runner(agent=agent, session_service=InMemorySessionService())

# First interaction
response1 = runner.query_sync(
    prompt="My name is Alice",
    user_id="user123"
)
session_id = response1['session_id']

# Continue conversation in same session
response2 = runner.query_sync(
    prompt="What's my name?",
    user_id="user123",
    session_id=session_id  # Use same session
)
# Agent should remember: "Your name is Alice"

# Get conversation history
history = runner.get_session_history(session_id)
```

## Troubleshooting

### API Key Issues

If you get "API key required" errors:
1. Check that ANTHROPIC_API_KEY or CLAUDE_API_KEY is set
2. Verify the key is valid at https://console.anthropic.com/
3. Try passing api_key directly to LlmAgent

### Tool Execution Errors

If tools aren't being called:
1. Check that tool descriptions are clear
2. Verify parameter schemas match function signatures
3. Ensure context parameter is first in function definition

### Import Errors

If you get import errors:
```bash
cd /path/to/obscureX
pip install -e .
```

## License

ISC License - See LICENSE file for details

## Contributing

This implementation follows the Google ADK interface design while using Anthropic Claude. Contributions are welcome!

## Resources

- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [Anthropic API Reference](https://docs.anthropic.com/api)
- [Google ADK (Original)](https://github.com/google/adk)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
