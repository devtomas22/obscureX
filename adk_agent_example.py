#!/usr/bin/env python3
"""
Example ADK-style agent using Anthropic Claude

This demonstrates the Google ADK interface adapted for Anthropic Claude.
Run this file to see a simple echo agent in action.
"""

# Import core ADK components
from obscurex.adk import LlmAgent, FunctionTool, InMemorySessionService, Runner


# Define a tool as a standard Python function
def echo_tool(context, message: str) -> str:
    """Repeats the user's message."""
    return f"Echo: {message}"


def calculator_tool(context, operation: str, a: float, b: float) -> float:
    """Performs basic arithmetic operations."""
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        if b == 0:
            return "Error: Division by zero"
        return a / b
    else:
        return f"Error: Unknown operation {operation}"


def weather_tool(context, location: str) -> str:
    """Gets weather information for a location."""
    # This is a mock implementation
    return f"The weather in {location} is sunny with a temperature of 72°F"


# Create tool declarations
echo_tool_decl = FunctionTool(
    name="echo_tool",
    func=echo_tool,
    description="Repeats the user's message"
)

calculator_tool_decl = FunctionTool(
    name="calculator",
    func=calculator_tool,
    description="Performs basic arithmetic operations (add, subtract, multiply, divide)",
    parameters={
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "description": "The operation to perform: add, subtract, multiply, or divide"
            },
            "a": {
                "type": "number",
                "description": "First number"
            },
            "b": {
                "type": "number",
                "description": "Second number"
            }
        },
        "required": ["operation", "a", "b"]
    }
)

weather_tool_decl = FunctionTool(
    name="weather",
    func=weather_tool,
    description="Gets weather information for a specific location",
    parameters={
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city or location to get weather for"
            }
        },
        "required": ["location"]
    }
)


def main():
    """Main function demonstrating ADK-style agent usage."""
    import os
    
    # Check for API key
    api_key = os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('CLAUDE_API_KEY')
    if not api_key:
        print("Error: ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable is required.")
        print("Get your key at: https://console.anthropic.com/")
        return
    
    print("=== ObscureX ADK-Style Agent Demo ===\n")
    
    # Instantiate an agent bound to Claude (not Gemini)
    agent = LlmAgent(
        name="DemoAgent",
        model="claude-3-5-sonnet-20241022",  # Using Anthropic Claude instead of Gemini
        instruction="You are a helpful assistant. Use the available tools when appropriate to help users.",
        tools=[echo_tool_decl, calculator_tool_decl, weather_tool_decl],
        api_key=api_key
    )
    
    # Run agent in a local Python context
    runner = Runner(agent=agent, session_service=InMemorySessionService())
    
    # Example 1: Simple echo
    print("Example 1: Echo tool")
    print("-" * 50)
    response = runner.query_sync(
        prompt="Use the echo tool to say 'Hello, ADK!'",
        user_id="demo"
    )
    print(f"Response: {response['response']}\n")
    
    # Example 2: Calculator
    print("Example 2: Calculator tool")
    print("-" * 50)
    response = runner.query_sync(
        prompt="What is 25 multiplied by 4?",
        user_id="demo"
    )
    print(f"Response: {response['response']}\n")
    
    # Example 3: Weather
    print("Example 3: Weather tool")
    print("-" * 50)
    response = runner.query_sync(
        prompt="What's the weather like in San Francisco?",
        user_id="demo"
    )
    print(f"Response: {response['response']}\n")
    
    # Example 4: General conversation
    print("Example 4: General conversation (no tools)")
    print("-" * 50)
    response = runner.query_sync(
        prompt="Tell me about AI agents in 2-3 sentences.",
        user_id="demo"
    )
    print(f"Response: {response['response']}\n")
    
    print("=== Demo Complete ===")


if __name__ == "__main__":
    main()
