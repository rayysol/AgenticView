// Single Responsibility: Input validation utilities

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError('URL must use HTTP or HTTPS protocol');
    }
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid URL format');
  }
}

export function validateSchemaId(schemaId: string): void {
  if (!schemaId || typeof schemaId !== 'string') {
    throw new ValidationError('Schema ID is required');
  }
  if (!schemaId.startsWith('schema_')) {
    throw new ValidationError('Invalid schema ID format');
  }
}

export function validateFieldName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('Field name is required');
  }
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    throw new ValidationError('Field name must be in snake_case format');
  }
}

export function validateCssSelector(selector: string): void {
  if (!selector || typeof selector !== 'string') {
    throw new ValidationError('CSS selector is required');
  }
  if (selector.trim().length === 0) {
    throw new ValidationError('CSS selector cannot be empty');
  }
}
