// AI Service types

export interface AISuggestRequest {
  element_html: string;
  element_text: string;
  parent_context?: string;
  current_fields?: string[];
}

export interface AISuggestion {
  field_name: string;
  data_type: string;
  currency_hint?: string;
  related_fields: string[];
  template_match?: string;
  template_confidence?: number;
}

export interface AISuggestResponse {
  success: boolean;
  suggestion?: AISuggestion;
  error?: string;
}
