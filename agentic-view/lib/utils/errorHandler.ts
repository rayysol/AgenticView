// Single Responsibility: Centralized error handling
import { ApiError, ErrorCode } from '../types/api.types';

export function createApiError(
  code: ErrorCode,
  message: string,
  suggestion?: string
): ApiError {
  return {
    success: false,
    error: code,
    message,
    suggestion,
  };
}

export function handleError(error: unknown): ApiError {
  if (error instanceof Error) {
    if (error.name === 'ValidationError') {
      return createApiError('VALIDATION_ERROR', error.message);
    }

    if (error.message.includes('MONGODB') || error.message.includes('database')) {
      return createApiError('DATABASE_ERROR', 'Database operation failed');
    }

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createApiError('INVALID_URL', 'Failed to fetch the target URL');
    }

    if (error.message.includes('AI') || error.message.includes('Claude')) {
      return createApiError(
        'AI_SUGGEST_FAILED',
        'Unable to generate AI suggestions',
        'You can manually enter field name and data type'
      );
    }

    if (error.message.includes('iframe') || error.message.includes('X-Frame-Options')) {
      return createApiError(
        'IFRAME_BLOCKED',
        'This website does not allow embedding',
        'Try a different website or use Playwright mode'
      );
    }

    return createApiError('EXTRACTION_FAILED', error.message);
  }

  return createApiError('EXTRACTION_FAILED', 'An unknown error occurred');
}
