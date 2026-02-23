// Interface Segregation Principle: AI service contract
import { AISuggestRequest, AISuggestion } from '../types/ai.types';

export interface IAIService {
  suggestField(request: AISuggestRequest): Promise<AISuggestion>;
  analyzeDOM(html: string): Promise<string[]>;
}
