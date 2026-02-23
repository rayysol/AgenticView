// Single Responsibility: Proxy and HTML manipulation
// Dependency Inversion: Implements IProxyService interface
import { chromium, Browser } from 'playwright';
import { IProxyService } from '../interfaces/IProxyService';

export class ProxyService implements IProxyService {
  private browser: Browser | null = null;

  async fetchPage(url: string): Promise<string> {
    try {
      if (!this.browser) {
        this.browser = await chromium.launch({ headless: true });
      }

      const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });

      const page = await context.newPage();

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const html = await page.content();
      await context.close();

      return html;
    } catch (error) {
      console.error('Proxy fetch error:', error);
      throw new Error(`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  injectScript(html: string, scriptPath: string): string {
    const scriptTag = `<script src="${scriptPath}"></script>`;

    if (html.includes('</body>')) {
      return html.replace('</body>', `${scriptTag}\n</body>`);
    }

    return html + scriptTag;
  }

  stripHeaders(html: string): string {
    // Remove CSP and X-Frame-Options meta tags
    let processed = html.replace(
      /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
      ''
    );
    processed = processed.replace(
      /<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi,
      ''
    );
    return processed;
  }

  rewriteUrls(html: string, baseUrl: string): string {
    try {
      const base = new URL(baseUrl);
      const origin = base.origin;

      // Rewrite relative URLs to absolute
      let processed = html.replace(
        /href=["'](?!http|https|\/\/|#)([^"']+)["']/gi,
        (match, path) => {
          const absoluteUrl = new URL(path, origin).href;
          return `href="${absoluteUrl}"`;
        }
      );

      processed = processed.replace(
        /src=["'](?!http|https|\/\/|data:)([^"']+)["']/gi,
        (match, path) => {
          const absoluteUrl = new URL(path, origin).href;
          return `src="${absoluteUrl}"`;
        }
      );

      return processed;
    } catch (error) {
      console.error('URL rewrite error:', error);
      return html;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
