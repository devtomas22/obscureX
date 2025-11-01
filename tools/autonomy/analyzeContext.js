/**
 * Tool: Analyze Context
 * Uses AI to analyze current context from memory and execution results to decide next action
 */
export default {
  name: 'analyzeContext',
  description: 'Use AI to analyze current context (memory, results) and decide the best next action',
  parameters: { 
    currentState: 'object', // Current execution state (MSE, iteration, etc.)
    objective: 'string', // What we're trying to achieve
    anthropic: 'object|null' 
  },
  
  async execute(params, context) {
    const { currentState, objective, anthropic } = params;
    
    if (!anthropic) {
      throw new Error('AI (Anthropic API) is required for context analysis. Please provide an API key.');
    }
    
    // Gather context from memory
    const shortTermContext = await this._getShortTermContext(context);
    const longTermContext = await this._getLongTermContext(context);
    
    // Build context summary
    const contextSummary = this._buildContextSummary(
      currentState, 
      shortTermContext, 
      longTermContext, 
      objective
    );
    
    // Use AI to analyze and decide
    const decision = await this._analyzeWithAI(contextSummary, anthropic);
    
    return {
      decision,
      contextUsed: {
        shortTermEntries: shortTermContext.length,
        longTermEntries: longTermContext.length,
        currentState
      },
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Get relevant short-term memory
   */
  async _getShortTermContext(context) {
    const entries = context.memory.entries || [];
    return entries.slice(-10); // Last 10 entries
  },
  
  /**
   * Get relevant long-term memory
   */
  async _getLongTermContext(context) {
    const entries = context.longTermMemory.entries || [];
    return entries.slice(-5); // Last 5 entries
  },
  
  /**
   * Build context summary for AI
   */
  _buildContextSummary(currentState, shortTerm, longTerm, objective) {
    return {
      objective,
      currentState,
      recentActivity: shortTerm.map(e => ({
        key: e.key,
        value: e.value,
        timestamp: e.timestamp
      })),
      historicalContext: longTerm.map(e => ({
        key: e.key,
        value: e.value,
        timestamp: e.timestamp
      }))
    };
  },
  
  /**
   * Use AI to analyze context and decide next action
   */
  async _analyzeWithAI(contextSummary, anthropic) {
    const systemPrompt = `You are an autonomous AI agent decision-maker for machine learning pipeline optimization.
Your role is to analyze the current context and decide the best next action.

Consider:
- Current performance metrics (MSE)
- Historical attempts and their results
- Available tools and capabilities
- The objective to achieve

Provide a clear, actionable decision with:
1. The recommended next action
2. Reasoning for this decision
3. Specific parameters or approach to use`;

    const userPrompt = `Analyze this context and decide the next best action:

OBJECTIVE: ${contextSummary.objective}

CURRENT STATE:
${JSON.stringify(contextSummary.currentState, null, 2)}

RECENT ACTIVITY (last 10 entries):
${this._summarizeActivity(contextSummary.recentActivity)}

HISTORICAL KNOWLEDGE:
${this._summarizeActivity(contextSummary.historicalContext)}

Based on this context, what should be the next action? Provide:
1. Action: (e.g., "optimize_pipeline", "add_features", "try_different_model", "continue_current_approach")
2. Reasoning: Why this action makes sense given the context
3. Details: Specific approach or parameters to use
4. Confidence: High/Medium/Low

Format your response as JSON.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    });

    const responseText = message.content[0].text;
    
    // Try to parse JSON response
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = responseText;
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        const codeMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1];
        }
      }
      
      return JSON.parse(jsonText);
    } catch (error) {
      // Fallback: return as structured text
      return {
        action: 'analyze_response',
        reasoning: 'AI provided non-JSON response',
        details: responseText,
        confidence: 'Medium'
      };
    }
  },
  
  /**
   * Summarize activity to avoid token limits
   */
  _summarizeActivity(activities) {
    if (!activities || activities.length === 0) {
      return 'No activity';
    }
    
    return activities.map(a => {
      const val = a.value || {};
      const key = a.key || 'unknown';
      
      // Extract key information only
      if (val.mse !== undefined) {
        return `${key}: MSE=${val.mse}${val.iteration ? `, iter=${val.iteration}` : ''}`;
      }
      return `${key}: ${JSON.stringify(val).substring(0, 100)}`;
    }).join('\n');
  }
};
