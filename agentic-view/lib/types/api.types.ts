// API Response types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  suggestion?: string;
}

export type ErrorCode =
  | 'INVALID_URL'
  | 'SCHEMA_NOT_FOUND'
  | 'IFRAME_BLOCKED'
  | 'AI_SUGGEST_FAILED'
  | 'EXTRACTION_FAILED'
  | 'DATABASE_ERROR'
  | 'VALIDATION_ERROR';
