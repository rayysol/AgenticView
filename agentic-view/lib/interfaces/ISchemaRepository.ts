// Interface Segregation Principle: Specific interface for Schema data access
import { Schema, CreateSchemaDTO } from '../types/schema.types';

export interface ISchemaRepository {
  create(data: CreateSchemaDTO): Promise<Schema>;
  findById(schemaId: string): Promise<Schema | null>;
  findAll(): Promise<Schema[]>;
  update(schemaId: string, data: Partial<Schema>): Promise<Schema | null>;
  delete(schemaId: string): Promise<boolean>;
}
