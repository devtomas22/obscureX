/**
 * Tool: Recommend Optimization Strategy
 * Uses AI to recommend optimization strategies based on MSE trends and execution history
 */
export default {
  name: 'recommendOptimizationStrategy',
  description: 'Analyze MSE trends and execution history to recommend the best optimization strategy',
  parameters: { 
    mseHistory: 'array', // Array of MSE values from recent iterations
    currentMSE: 'number',
    targetMSE: 'number',
    iterationNumber: 'number',
    anthropic: 'object|null'
  },
  
  async execute(params, context) {
    const { mseHistory, currentMSE, targetMSE, iterationNumber, anthropic } = params;
    
    if (!anthropic) {
      // Fallback to rule-based strategy
      return this._fallbackStrategy(mseHistory, currentMSE, targetMSE, iterationNumber);
    }
    
    // Analyze trends
    const trends = this._analyzeTrends(mseHistory);
    
    // Get memory context
    const recentAttempts = await this._getRecentAttempts(context);
    
    // Use AI to recommend strategy
    const recommendation = await this._getAIRecommendation(
      { mseHistory, currentMSE, targetMSE, iterationNumber, trends, recentAttempts },
      anthropic
    );
    
    return {
      recommendation,
      trends,
      context: {
        recentAttempts: recentAttempts.length,
        currentProgress: ((targetMSE / currentMSE) * 100).toFixed(1) + '%',
        iterationNumber
      },
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Analyze MSE trends
   */
  _analyzeTrends(mseHistory) {
    if (!mseHistory || mseHistory.length < 2) {
      return {
        trend: 'insufficient_data',
        improvement: false,
        stagnant: false
      };
    }
    
    const recent = mseHistory.slice(-5);
    const improvements = [];
    
    for (let i = 1; i < recent.length; i++) {
      improvements.push(recent[i-1] - recent[i]);
    }
    
    const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
    const isImproving = avgImprovement > 0;
    const isStagnant = Math.abs(avgImprovement) < 0.001;
    
    return {
      trend: isImproving ? 'improving' : 'declining',
      improvement: isImproving,
      stagnant: isStagnant,
      avgImprovement,
      recentMSEs: recent
    };
  },
  
  /**
   * Get recent optimization attempts from memory
   */
  async _getRecentAttempts(context) {
    const entries = context.memory.entries || [];
    return entries.filter(e => 
      e.key && e.key.startsWith('iteration_') && 
      e.value && typeof e.value.mse === 'number'
    ).slice(-10);
  },
  
  /**
   * Use AI to recommend optimization strategy
   */
  async _getAIRecommendation(analysisContext, anthropic) {
    const systemPrompt = `You are an expert ML optimization strategist specializing in cryptocurrency price prediction.
Your role is to analyze MSE trends and recommend the most effective optimization strategy.

Consider:
- Current MSE and target MSE
- Historical MSE trend (improving, declining, stagnant)
- Number of iterations completed
- Recent optimization attempts and their results
- Best practices for ML optimization

Provide a specific, actionable optimization strategy.`;

    const userPrompt = `Analyze this optimization scenario and recommend the best strategy:

CURRENT STATUS:
- Current MSE: ${analysisContext.currentMSE}
- Target MSE: ${analysisContext.targetMSE}
- Iteration: ${analysisContext.iterationNumber}
- Progress: ${analysisContext.context?.currentProgress || 'N/A'}

MSE TRENDS:
- Trend: ${analysisContext.trends.trend}
- Improving: ${analysisContext.trends.improvement}
- Stagnant: ${analysisContext.trends.stagnant}
- Recent MSEs: ${JSON.stringify(analysisContext.trends.recentMSEs)}

RECENT ATTEMPTS:
${JSON.stringify(analysisContext.recentAttempts.slice(-5), null, 2)}

Based on this analysis, recommend:
1. Primary strategy to apply
2. Specific technique or approach
3. Expected impact
4. Alternative strategy if primary fails
5. Whether to try a completely different approach

Format response as JSON with keys: strategy, technique, expectedImpact, alternativeStrategy, tryDifferentApproach (boolean)`;

    try {
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
      
      // Parse JSON response
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
      return this._fallbackStrategy(
        analysisContext.mseHistory, 
        analysisContext.currentMSE, 
        analysisContext.targetMSE, 
        analysisContext.iterationNumber
      );
    }
  },
  
  /**
   * Fallback rule-based strategy when AI is not available
   */
  _fallbackStrategy(mseHistory, currentMSE, targetMSE, iterationNumber) {
    const trends = this._analyzeTrends(mseHistory);
    
    let strategy, technique;
    
    if (trends.stagnant) {
      strategy = 'Try different approach';
      technique = 'Switch to ensemble methods or different model architecture';
    } else if (!trends.improvement) {
      strategy = 'Simplify and regularize';
      technique = 'Add regularization, reduce model complexity';
    } else if (iterationNumber < 10) {
      strategy = 'Hyperparameter tuning';
      technique = 'Apply GridSearchCV for optimal parameters';
    } else if (iterationNumber < 20) {
      strategy = 'Feature engineering';
      technique = 'Add polynomial features and feature interactions';
    } else {
      strategy = 'Ensemble methods';
      technique = 'Combine multiple models with voting or stacking';
    }
    
    return {
      strategy,
      technique,
      expectedImpact: 'Moderate improvement expected',
      alternativeStrategy: 'Try cross-validation with different model',
      tryDifferentApproach: trends.stagnant || !trends.improvement
    };
  }
};
