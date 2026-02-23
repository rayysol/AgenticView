// Single Responsibility: AI-powered field suggestion
// Dependency Inversion: Implements IAIService interface
import Anthropic from '@anthropic-ai/sdk';
import { IAIService } from '../interfaces/IAIService';
import { AISuggestRequest, AISuggestion } from '../types/ai.types';

export class AIService implements IAIService {
  private client: Anthropic | null = null;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
  }

  private getClient(): Anthropic {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    if (!this.client) {
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
    return this.client;
  }

  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    const prompt = this.buildPrompt(request);

    try {
      const client = this.getClient();
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      return this.parseResponse(content.text);
    } catch (error) {
      console.error('AI suggestion error:', error);
      throw new Error('Failed to generate AI suggestion');
    }
  }

  async analyzeDOM(html: string): Promise<string[]> {
    const prompt = `Analyze this HTML and identify elements that likely contain extractable data (prices, names, dates, etc.). Return only CSS selectors, one per line.

HTML:
${html.substring(0, 5000)}

Return format: Just CSS selectors, one per line.`;

    try {
      const client = this.getClient();
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        return [];
      }

      return content.text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
    } catch (error) {
      console.error('DOM analysis error:', error);
      return [];
    }
  }

  private buildPrompt(request: AISuggestRequest): string {
    return `You are an expert at analyzing HTML elements and suggesting appropriate field names and data types for web scraping.

Given this element:
HTML: ${request.element_html}
Text: ${request.element_text}
${request.parent_context ? `Parent context: ${request.parent_context}` : ''}
${request.current_fields ? `Already defined fields: ${request.current_fields.join(', ')}` : ''}

Suggest:
1. A field name in snake_case
2. Data type: string, number, currency, date, or boolean
3. If currency, include currency code (USD, EUR, etc.)
4. Up to 3 related fields that might be useful
5. Template match (e-commerce_product, article, listing, etc.) with confidence 0-1

Return ONLY valid JSON in this exact format:
{
  "field_name": "product_price",
  "data_type": "currency",
  "currency_hint": "USD",
  "related_fields": ["original_price", "discount_percent", "in_stock"],
  "template_match": "e-commerce_product",
  "template_confidence": 0.91
}`;
  }

  private parseResponse(text: string): AISuggestion {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        field_name: parsed.field_name || 'unknown_field',
        data_type: parsed.data_type || 'string',
        currency_hint: parsed.currency_hint,
        related_fields: parsed.related_fields || [],
        template_match: parsed.template_match,
        template_confidence: parsed.template_confidence,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}
