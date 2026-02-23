// Single Responsibility: Data extraction from web pages
// Dependency Inversion: Implements IExtractionService interface
import { chromium, Browser } from 'playwright';
import { IExtractionService } from '../interfaces/IExtractionService';
import { Schema, FetchResult, DataType } from '../types/schema.types';

export class ExtractionService implements IExtractionService {
  private browser: Browser | null = null;

  async extractData(schema: Schema, targetUrl: string): Promise<FetchResult> {
    try {
      if (!this.browser) {
        this.browser = await chromium.launch({ headless: true });
      }

      const context = await this.browser.newContext();
      const page = await context.newPage();

      await page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const data: Record<string, unknown> = {};

      for (const field of schema.fields) {
        try {
          const element = await page.$(field.css_selector);
          if (!element) {
            console.warn(`Selector not found: ${field.css_selector}`);
            data[field.name] = null;
            continue;
          }

          const textContent = await element.textContent();
          const rawValue = textContent?.trim() || '';

          data[field.name] = this.castValue(rawValue, field.data_type);
        } catch (error) {
          console.error(`Error extracting field ${field.name}:`, error);
          data[field.name] = null;
        }
      }

      await context.close();

      return {
        schema_id: schema.schema_id,
        url: targetUrl,
        extracted_at: new Date().toISOString(),
        data,
      };
    } catch (error) {
      console.error('Extraction error:', error);
      throw new Error(`Failed to extract data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateSelectors(schema: Schema, targetUrl: string): Promise<boolean> {
    try {
      if (!this.browser) {
        this.browser = await chromium.launch({ headless: true });
      }

      const context = await this.browser.newContext();
      const page = await context.newPage();

      await page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      let allValid = true;

      for (const field of schema.fields) {
        const element = await page.$(field.css_selector);
        if (!element) {
          console.warn(`Invalid selector: ${field.css_selector}`);
          allValid = false;
        }
      }

      await context.close();
      return allValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  private castValue(value: string, dataType: DataType): unknown {
    switch (dataType) {
      case 'number':
        return this.parseNumber(value);
      case 'currency':
        return this.parseCurrency(value);
      case 'boolean':
        return this.parseBoolean(value);
      case 'date':
        return this.parseDate(value);
      case 'string':
      default:
        return value;
    }
  }

  private parseNumber(value: string): number | null {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  private parseCurrency(value: string): number | null {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  private parseBoolean(value: string): boolean {
    const lower = value.toLowerCase().trim();
    const trueValues = ['true', 'yes', '1', 'in stock', 'available', 'active'];
    return trueValues.some(v => lower.includes(v));
  }

  private parseDate(value: string): string | null {
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
