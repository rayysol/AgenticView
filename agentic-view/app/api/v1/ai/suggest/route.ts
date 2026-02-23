// API Route: AI-powered field suggestion
import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/AIService';
import { AISuggestRequest } from '@/lib/types/ai.types';
import { handleError } from '@/lib/utils/errorHandler';

let aiService: AIService | null = null;

function getAIService(): AIService {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
}

export async function POST(request: NextRequest) {
  try {
    const body: AISuggestRequest = await request.json();

    if (!body.element_html || !body.element_text) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'element_html and element_text are required',
        },
        { status: 400 }
      );
    }

    const service = getAIService();
    const suggestion = await service.suggestField(body);

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('AI suggest error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}
