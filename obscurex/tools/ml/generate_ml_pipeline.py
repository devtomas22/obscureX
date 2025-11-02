"""
Tool: Generate ML Pipeline
Generates Python code for ML pipelines using CatBoost and/or Neural Networks
Optimized for Binance price prediction data
"""

import os
from datetime import datetime
from typing import Dict, Any, Optional


async def _initialize_ml_pipeline_with_ai(prompt: str, ai_service) -> str:
    """Initialize a new ML pipeline using AI Service."""
    system_prompt = """You are an expert Python ML engineer specializing in cryptocurrency price prediction pipelines using Binance data.
Generate complete, production-ready Python code for machine learning pipelines.
The code should:
- Be complete and runnable
- Include proper imports
- Use scikit-learn for preprocessing
- Include CatBoost and/or Neural Networks as requested
- Calculate and print MSE as the final output
- Handle data loading from Binance CSV files (timestamp, open, high, low, close, volume format)
- Include proper error handling
- Follow best practices"""

    user_prompt = f"""Generate a complete Python ML pipeline for: {prompt}

Requirements:
- Complete, executable Python code
- Use pandas for data handling
- Work with Binance CSV format (timestamp, open, high, low, close, volume)
- Include train/test split
- Scale features appropriately
- Calculate MSE and print it as "MSE: <value>"
- Add comments for clarity

Return ONLY the Python code, no explanations."""

    return await ai_service.generate_code(user_prompt, system_prompt, 4096)


async def _optimize_ml_pipeline_with_ai(existing_code: str, prompt: str, ai_service) -> str:
    """Optimize existing ML pipeline using AI Service."""
    system_prompt = """You are an expert Python ML engineer specializing in optimizing cryptocurrency price prediction pipelines.
Improve existing ML pipeline code based on the optimization prompt.
The optimized code should:
- Maintain the core structure of the original
- Implement the requested improvements
- Be complete and runnable
- Calculate and print MSE as the final output
- Follow best practices"""

    user_prompt = f"""Optimize this ML pipeline: {prompt}

Current code:
```python
{existing_code}
```

Requirements:
- Implement the requested optimization
- Maintain complete, executable Python code
- Keep MSE calculation and printing
- Add comments for changes

Return ONLY the improved Python code, no explanations."""

    return await ai_service.generate_code(user_prompt, system_prompt, 4096)


async def execute(params: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generate ML pipeline code using AI."""
    existing_code = params.get('existingCode')
    prompt = params.get('prompt')
    ai_service = params.get('aiService')
    
    if not ai_service or not ai_service.is_available():
        raise Exception('AI (Anthropic Claude API) is required for generating ML pipelines. Please provide an API key.')
    
    # Always use AI Service for code generation
    try:
        if existing_code:
            code = await _optimize_ml_pipeline_with_ai(existing_code, prompt, ai_service)
        else:
            code = await _initialize_ml_pipeline_with_ai(prompt, ai_service)
    except Exception as error:
        raise Exception(f'Failed to generate ML pipeline with AI: {str(error)}')
    
    # Write to file
    timestamp = int(datetime.now().timestamp())
    output_file = os.path.join(os.getcwd(), f'ml_pipeline_{timestamp}.py')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(code)
    
    return {
        'success': True,
        'code': code,
        'filename': output_file,
        'message': f'ML pipeline generated and saved to {output_file}'
    }


# Tool definition
tool = {
    'name': 'generateMLPipeline',
    'description': 'Generate ML pipeline code using CatBoost and/or Neural Networks (works with Binance price data)',
    'parameters': {'existingCode': 'string|null', 'prompt': 'string', 'aiService': 'object|null'},
    'execute': execute
}
