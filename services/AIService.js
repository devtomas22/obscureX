import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Service Layer for Anthropic Claude
 * Centralizes all AI-related operations and configuration
 */
class AIService {
  constructor(apiKey = null) {
    this.client = null;
    this.modelName = 'claude-sonnet-4-20250514';
    
    if (apiKey || process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY
      });
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Get the configured model name
   */
  getModelName() {
    return this.modelName;
  }

  /**
   * Create a message using Claude
   * @param {Object} options - Message options
   * @param {Array} options.messages - Array of message objects
   * @param {string} options.system - System prompt
   * @param {number} options.max_tokens - Maximum tokens to generate
   * @returns {Promise<Object>} - Message response
   */
  async createMessage({ messages, system, max_tokens = 1024 }) {
    if (!this.client) {
      throw new Error('AI (Anthropic API) is required. Please provide an API key.');
    }

    const params = {
      model: this.modelName,
      max_tokens,
      messages
    };

    if (system) {
      params.system = system;
    }

    return await this.client.messages.create(params);
  }

  /**
   * Generate code using Claude
   * @param {string} prompt - User prompt
   * @param {string} systemPrompt - System prompt
   * @param {number} maxTokens - Maximum tokens
   * @returns {Promise<string>} - Generated code
   */
  async generateCode(prompt, systemPrompt, maxTokens = 4096) {
    const message = await this.createMessage({
      messages: [{ role: 'user', content: prompt }],
      system: systemPrompt,
      max_tokens: maxTokens
    });

    let code = message.content[0].text;
    // Clean up markdown code blocks
    code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '');
    return code.trim();
  }

  /**
   * Analyze context and make decisions
   * @param {string} prompt - User prompt
   * @param {string} systemPrompt - System prompt
   * @param {number} maxTokens - Maximum tokens
   * @returns {Promise<Object>} - Decision object
   */
  async analyzeAndDecide(prompt, systemPrompt, maxTokens = 1024) {
    const message = await this.createMessage({
      messages: [{ role: 'user', content: prompt }],
      system: systemPrompt,
      max_tokens: maxTokens
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
      // Return text response if JSON parsing fails
      return {
        response: responseText,
        parsed: false
      };
    }
  }

  /**
   * Generate text response
   * @param {string} prompt - User prompt
   * @param {string} systemPrompt - System prompt
   * @param {number} maxTokens - Maximum tokens
   * @returns {Promise<string>} - Generated text
   */
  async generateText(prompt, systemPrompt, maxTokens = 1024) {
    const message = await this.createMessage({
      messages: [{ role: 'user', content: prompt }],
      system: systemPrompt,
      max_tokens: maxTokens
    });

    return message.content[0].text.trim();
  }
}

export default AIService;
