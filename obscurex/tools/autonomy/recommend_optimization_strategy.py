"""
Tool: Recommend Optimization Strategy
Analyzes MSE trends and recommends optimization strategies
"""

from typing import Dict, Any, List


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Analyze MSE trends and recommend optimization strategy."""
    mse_history = params.get('mseHistory', [])
    current_mse = params.get('currentMSE')
    target_mse = params.get('targetMSE')
    iteration_number = params.get('iterationNumber', 0)
    ai_service = params.get('aiService')
    
    # Analyze trends
    trends = {
        'trend': 'unknown',
        'improvement': False,
        'stagnant': False,
        'avgImprovement': 0
    }
    
    if len(mse_history) >= 2:
        recent_improvements = [mse_history[i] - mse_history[i+1] for i in range(len(mse_history)-1)]
        avg_improvement = sum(recent_improvements) / len(recent_improvements) if recent_improvements else 0
        
        trends['avgImprovement'] = avg_improvement
        trends['improvement'] = avg_improvement > 0
        trends['trend'] = 'improving' if avg_improvement > 0 else 'declining'
        trends['stagnant'] = abs(avg_improvement) < 0.001
    
    # Get AI recommendation
    recommendation = {
        'strategy': 'Continue current approach',
        'technique': 'Keep optimizing with current methods',
        'expectedImpact': 'Moderate improvement expected',
        'tryDifferentApproach': trends.get('stagnant', False)
    }
    
    if ai_service and ai_service.is_available():
        try:
            prompt = f"""MSE History: {mse_history}
Current MSE: {current_mse}
Target MSE: {target_mse}
Iteration: {iteration_number}

Recommend an optimization strategy as JSON with keys: strategy, technique, expectedImpact, tryDifferentApproach."""
            
            ai_rec = await ai_service.analyze_and_decide(prompt, "You are an ML optimization expert.", 512)
            if isinstance(ai_rec, dict) and 'strategy' in ai_rec:
                recommendation = ai_rec
        except:
            pass
    
    return {
        'recommendation': recommendation,
        'trends': trends
    }


# Tool definition
tool = {
    'name': 'recommendOptimizationStrategy',
    'description': 'Analyze MSE trends and execution history to recommend the best optimization strategy',
    'parameters': {
        'mseHistory': 'array',
        'currentMSE': 'number',
        'targetMSE': 'number',
        'iterationNumber': 'number',
        'aiService': 'object|null'
    },
    'execute': execute
}
