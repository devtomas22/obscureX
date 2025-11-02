"""
Tool: Get Execution Options
Gets available execution flow options based on current state
"""

from typing import Dict, Any


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Get available execution flow options."""
    current_phase = params.get('currentPhase', 'initialization')
    current_state = params.get('currentState', {})
    ai_service = params.get('aiService')
    
    # Define available options based on phase
    options_map = {
        'initialization': [
            {'action': 'prepare_data', 'description': 'Prepare and validate data'},
            {'action': 'add_indicators', 'description': 'Add technical indicators'}
        ],
        'optimization': [
            {'action': 'continue_optimization', 'description': 'Continue with current optimization strategy'},
            {'action': 'hyperparameter_tuning', 'description': 'Apply hyperparameter tuning'},
            {'action': 'feature_engineering', 'description': 'Improve feature engineering'}
        ],
        'evaluation': [
            {'action': 'analyze_results', 'description': 'Analyze optimization results'},
            {'action': 'finalize', 'description': 'Finalize best pipeline'}
        ]
    }
    
    options = options_map.get(current_phase, [])
    
    # Get AI recommendations if available
    ai_recommendations = []
    if ai_service and ai_service.is_available():
        try:
            prompt = f"Current phase: {current_phase}, State: {current_state}. Recommend top action."
            rec = await ai_service.generate_text(prompt, "Recommend one action briefly.", 256)
            ai_recommendations = [{'recommendation': rec, 'priority': 1}]
        except:
            pass
    
    return {
        'phase': current_phase,
        'options': options,
        'aiRecommendations': ai_recommendations
    }


# Tool definition
tool = {
    'name': 'getExecutionOptions',
    'description': 'Get available execution flow options and next possible actions based on current state',
    'parameters': {'currentPhase': 'string', 'currentState': 'object', 'aiService': 'object|null'},
    'execute': execute
}
