// Core domain types following SOLID principles

export type DataType = 'string' | 'number' | 'currency' | 'date' | 'boolean';

export interface SchemaField {
  name: string;
  css_selector: string;
  data_type: DataType;
  confidence: number;
  currency_hint?: string;
}

export interface Schema {
  _id?: string;
  schema_id: string;
  name: string;
  source_url: string;
  created_at: Date;
  fields: SchemaField[];
  sample_output: Record<string, unknown>;
}

export interface CreateSchemaDTO {
  name: string;
  source_url: string;
  fields: SchemaField[];
  sample_output: Record<string, unknown>;
}

export interface ExportSchemaFormat {
  schema_version: string;
  schema_id: string;
  name: string;
  created_at: string;
  source_url: string;
  fields: SchemaField[];
  sample_output: Record<string, unknown>;
}

export interface FetchResult {
  schema_id: string;
  url: string;
  extracted_at: string;
  data: Record<string, unknown>;
}
