// API Route: Live data extraction endpoint for AI agents
import { NextRequest, NextResponse } from 'next/server';
import { SchemaRepository } from '@/lib/repositories/SchemaRepository';
import { ExtractionService } from '@/lib/services/ExtractionService';
import { handleError, createApiError } from '@/lib/utils/errorHandler';
import { validateSchemaId, validateUrl } from '@/lib/utils/validators';

let schemaRepository: SchemaRepository | null = null;
let extractionService: ExtractionService | null = null;

function getSchemaRepository(): SchemaRepository {
  if (!schemaRepository) {
    schemaRepository = new SchemaRepository();
  }
  return schemaRepository;
}

function getExtractionService(): ExtractionService {
  if (!extractionService) {
    extractionService = new ExtractionService();
  }
  return extractionService;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        createApiError('INVALID_URL', 'URL parameter is required'),
        { status: 400 }
      );
    }

    validateSchemaId(schemaId);
    validateUrl(url);

    const repo = getSchemaRepository();
    const schema = await repo.findById(schemaId);

    if (!schema) {
      return NextResponse.json(
        createApiError('SCHEMA_NOT_FOUND', 'Schema does not exist'),
        { status: 404 }
      );
    }

    const service = getExtractionService();
    const result = await service.extractData(schema, url);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}
