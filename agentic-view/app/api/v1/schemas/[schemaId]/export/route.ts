// API Route: Export schema as JSON file
import { NextRequest, NextResponse } from 'next/server';
import { SchemaRepository } from '@/lib/repositories/SchemaRepository';
import { ExportSchemaFormat } from '@/lib/types/schema.types';
import { handleError, createApiError } from '@/lib/utils/errorHandler';
import { validateSchemaId } from '@/lib/utils/validators';

let schemaRepository: SchemaRepository | null = null;

function getSchemaRepository(): SchemaRepository {
  if (!schemaRepository) {
    schemaRepository = new SchemaRepository();
  }
  return schemaRepository;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;
    validateSchemaId(schemaId);

    const repo = getSchemaRepository();
    const schema = await repo.findById(schemaId);

    if (!schema) {
      return NextResponse.json(
        createApiError('SCHEMA_NOT_FOUND', 'Schema does not exist'),
        { status: 404 }
      );
    }

    const exportData: ExportSchemaFormat = {
      schema_version: '1.0',
      schema_id: schema.schema_id,
      name: schema.name,
      created_at: schema.created_at.toISOString(),
      source_url: schema.source_url,
      fields: schema.fields,
      sample_output: schema.sample_output,
    };

    const filename = `${schema.name.replace(/\s+/g, '_').toLowerCase()}_schema.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}
