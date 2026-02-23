// API Route: Individual schema operations
import { NextRequest, NextResponse } from 'next/server';
import { SchemaRepository } from '@/lib/repositories/SchemaRepository';
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

    return NextResponse.json({
      success: true,
      data: schema,
    });
  } catch (error) {
    console.error('Get schema error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;
    validateSchemaId(schemaId);

    const repo = getSchemaRepository();
    const deleted = await repo.delete(schemaId);

    if (!deleted) {
      return NextResponse.json(
        createApiError('SCHEMA_NOT_FOUND', 'Schema does not exist'),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schema deleted successfully',
    });
  } catch (error) {
    console.error('Delete schema error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}
