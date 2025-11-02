"""
Tool: Analyze Context
Uses AI to analyze current context and decide the best next action
"""

from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Use AI to analyze current context and decide next action."""
    current_state = params.get('currentState', {})
    objective = params.get('objective', '')
    ai_service = params.get('aiService')
    
    if not ai_service or not ai_service.is_available():
        raise Exception('AI (Anthropic Claude API) is required for context analysis. Please provide an API key.')
    
    # Build prompt for AI
    system_prompt = """You are an AI orchestrator for cryptocurrency ML pipeline optimization.
Analyze the current state and context to decide the best next action.
Return your decision as JSON with keys: action, reasoning, details, confidence."""
    
    user_prompt = f"""Current State: {current_state}
Objective: {objective}

Analyze the state and recommend the best next action to achieve the objective.
Return JSON format."""
    
    decision = await ai_service.analyze_and_decide(user_prompt, system_prompt, 1024)
    
    return {
        'decision': decision,
        'contextUsed': {
            'shortTermEntries': len(context.get('memory', {}).get('entries', [])) if context else 0,
            'longTermEntries': len(context.get('longTermMemory', {}).get('entries', [])) if context else 0
        }
    }


# Tool definition
tool = {
    'name': 'analyzeContext',
    'description': 'Use AI to analyze current context (memory, results) and decide the best next action',
    'parameters': {'currentState': 'object', 'objective': 'string', 'aiService': 'object|null'},
    'execute': execute
}
