// Interface Segregation Principle: Data extraction contract
import { Schema, FetchResult } from '../types/schema.types';

export interface IExtractionService {
  extractData(schema: Schema, targetUrl: string): Promise<FetchResult>;
  validateSelectors(schema: Schema, targetUrl: string): Promise<boolean>;
}
