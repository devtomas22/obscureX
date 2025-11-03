#!/usr/bin/env python3
"""
Test for ADK implementation

Tests the Google ADK-style interface with Anthropic Claude.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from obscurex.adk import LlmAgent, FunctionTool, InMemorySessionService, Runner


def test_basic_agent():
    """Test basic agent functionality without API calls."""
    print("Test 1: Basic agent initialization")
    print("-" * 50)
    
    # This will fail without API key, but we can test the structure
    try:
        agent = LlmAgent(
            name="TestAgent",
            model="claude-3-5-sonnet-20241022",
            instruction="You are a test agent.",
            tools=[],
            api_key="test-key-placeholder"  # Placeholder
        )
        print("✓ Agent initialized successfully")
        print(f"  - Name: {agent.name}")
        print(f"  - Model: {agent.model}")
        print(f"  - Instruction: {agent.instruction}")
        return True
    except Exception as e:
        print(f"✗ Agent initialization failed: {e}")
        return False


def test_function_tool():
    """Test FunctionTool creation and schema."""
    print("\nTest 2: FunctionTool creation")
    print("-" * 50)
    
    def test_func(context, message: str, count: int = 1) -> str:
        return message * count
    
    try:
        tool = FunctionTool(
            name="repeat",
            func=test_func,
            description="Repeats a message"
        )
        
        print("✓ FunctionTool created successfully")
        print(f"  - Name: {tool.name}")
        print(f"  - Description: {tool.description}")
        
        # Test Claude format conversion
        claude_format = tool.to_claude_format()
        print(f"  - Claude format: {claude_format['name']}")
        
        # Test tool execution
        result = tool.execute({"message": "Hi", "count": 3}, None)
        assert result == "HiHiHi", "Tool execution failed"
        print(f"  - Execution test: '{result}' ✓")
        
        return True
    except Exception as e:
        print(f"✗ FunctionTool test failed: {e}")
        return False


def test_session_service():
    """Test InMemorySessionService."""
    print("\nTest 3: InMemorySessionService")
    print("-" * 50)
    
    try:
        service = InMemorySessionService()
        
        # Create session
        session_id = service.create_session("test_user")
        print(f"✓ Session created: {session_id}")
        
        # Add messages
        service.add_message(session_id, "user", "Hello")
        service.add_message(session_id, "assistant", "Hi there!")
        
        # Get messages
        messages = service.get_messages(session_id)
        assert len(messages) == 2, "Message count mismatch"
        print(f"✓ Messages added and retrieved: {len(messages)} messages")
        
        # Get session
        session = service.get_session(session_id)
        assert session is not None, "Session not found"
        print(f"✓ Session retrieved: user_id={session['user_id']}")
        
        return True
    except Exception as e:
        print(f"✗ Session service test failed: {e}")
        return False


def test_runner_structure():
    """Test Runner structure (without actual API calls)."""
    print("\nTest 4: Runner structure")
    print("-" * 50)
    
    try:
        # Create mock agent (will fail on actual use, but structure is testable)
        agent = LlmAgent(
            name="TestAgent",
            model="claude-3-5-sonnet-20241022",
            instruction="Test",
            tools=[],
            api_key="placeholder"
        )
        
        session_service = InMemorySessionService()
        runner = Runner(agent=agent, session_service=session_service)
        
        print("✓ Runner created successfully")
        print(f"  - Agent: {runner.agent.name}")
        print(f"  - Session service: {type(runner.session_service).__name__}")
        
        return True
    except Exception as e:
        print(f"✗ Runner structure test failed: {e}")
        return False


def test_fastapi_integration():
    """Test FastAPI integration imports."""
    print("\nTest 5: FastAPI integration")
    print("-" * 50)
    
    try:
        from obscurex.adk import ADKAgent, add_adk_fastapi_endpoint
        from fastapi import FastAPI
        
        print("✓ FastAPI integration imports successful")
        print(f"  - ADKAgent: {ADKAgent.__name__}")
        print(f"  - add_adk_fastapi_endpoint: {add_adk_fastapi_endpoint.__name__}")
        
        return True
    except Exception as e:
        print(f"✗ FastAPI integration test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("ADK Implementation Tests (Structure & Components)")
    print("=" * 60)
    print()
    
    tests = [
        test_basic_agent,
        test_function_tool,
        test_session_service,
        test_runner_structure,
        test_fastapi_integration
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print(f"Test Results: {sum(results)}/{len(results)} passed")
    print("=" * 60)
    
    if all(results):
        print("\n✓ All structure tests passed!")
        print("\nNote: To test actual agent functionality, set ANTHROPIC_API_KEY")
        print("and run: python adk_agent_example.py")
        return 0
    else:
        print("\n✗ Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
