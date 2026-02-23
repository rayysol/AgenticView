// API Route: Schema CRUD operations
import { NextRequest, NextResponse } from 'next/server';
import { SchemaRepository } from '@/lib/repositories/SchemaRepository';
import { CreateSchemaDTO } from '@/lib/types/schema.types';
import { handleError } from '@/lib/utils/errorHandler';
import { validateFieldName, validateCssSelector } from '@/lib/utils/validators';

let schemaRepository: SchemaRepository | null = null;

function getSchemaRepository(): SchemaRepository {
  if (!schemaRepository) {
    schemaRepository = new SchemaRepository();
  }
  return schemaRepository;
}

export async function GET() {
  try {
    const repo = getSchemaRepository();
    const schemas = await repo.findAll();
    return NextResponse.json({
      success: true,
      data: schemas,
    });
  } catch (error) {
    console.error('Get schemas error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSchemaDTO = await request.json();

    if (!body.name || !body.source_url || !body.fields || body.fields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'name, source_url, and at least one field are required',
        },
        { status: 400 }
      );
    }

    for (const field of body.fields) {
      validateFieldName(field.name);
      validateCssSelector(field.css_selector);
    }

    const repo = getSchemaRepository();
    const schema = await repo.create(body);

    return NextResponse.json(
      {
        success: true,
        data: schema,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create schema error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}
