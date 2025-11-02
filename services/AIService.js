import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service Layer for Google Gemini
 * Centralizes all AI-related operations and configuration
 */
class AIService {
  constructor(apiKey = null) {
    this.client = null;
    this.model = null;
    this.modelName = 'gemini-2.0-flash-exp';
    
    const key = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (key) {
      this.client = new GoogleGenerativeAI(key);
      this.model = this.client.getGenerativeModel({ model: this.modelName });
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return this.client !== null && this.model !== null;
  }

  /**
   * Get the configured model name
   */
  getModelName() {
    return this.modelName;
  }

  /**
   * Create a message using Gemini
   * @param {Object} options - Message options
   * @param {Array} options.messages - Array of message objects
   * @param {string} options.system - System prompt
   * @param {number} options.max_tokens - Maximum tokens to generate
   * @returns {Promise<Object>} - Message response
   */
  async createMessage({ messages, system, max_tokens = 1024 }) {
    if (!this.model) {
      throw new Error('AI (Google Gemini API) is required. Please provide an API key.');
    }

    // Convert messages format to Gemini format
    // Gemini uses a simpler format with 'parts' array
    let conversationHistory = [];
    let fullPrompt = '';

    // Add system prompt as context if provided
    if (system) {
      fullPrompt = `${system}\n\n`;
    }

    // Combine messages into a single prompt
    // Gemini doesn't have the same message role structure as other APIs
    for (const msg of messages) {
      if (msg.role === 'user') {
        fullPrompt += msg.content + '\n';
      } else if (msg.role === 'assistant') {
        // For multi-turn conversations, we'd need to use chat
        if (fullPrompt.trim()) {
          conversationHistory.push({
            role: 'user',
            parts: [{ text: fullPrompt.trim() }]
          });
        }
        conversationHistory.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
        fullPrompt = system ? `${system}\n\n` : '';
      }
    }

    const generationConfig = {
      maxOutputTokens: max_tokens,
      temperature: 0.7,
    };

    // Use chat if we have conversation history
    if (conversationHistory.length > 0) {
      const chat = this.model.startChat({
        history: conversationHistory,
        generationConfig
      });
      const result = await chat.sendMessage(fullPrompt);
      return {
        content: [{ text: result.response.text() }]
      };
    } else {
      // Single turn generation
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig
      });
      return {
        content: [{ text: result.response.text() }]
      };
    }
  }

  /**
   * Generate code using Gemini
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
