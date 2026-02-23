// API Route: Proxy endpoint for fetching and processing web pages
import { NextRequest, NextResponse } from 'next/server';
import { ProxyService } from '@/lib/services/ProxyService';
import { validateUrl } from '@/lib/utils/validators';
import { handleError } from '@/lib/utils/errorHandler';

let proxyService: ProxyService | null = null;

function getProxyService(): ProxyService {
  if (!proxyService) {
    proxyService = new ProxyService();
  }
  return proxyService;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'INVALID_URL', message: 'URL parameter is required' },
        { status: 400 }
      );
    }

    validateUrl(url);

    const service = getProxyService();
    let html = await service.fetchPage(url);
    html = service.stripHeaders(html);
    html = service.rewriteUrls(html, url);
    html = service.injectScript(html, '/selector.js');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    const apiError = handleError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}
