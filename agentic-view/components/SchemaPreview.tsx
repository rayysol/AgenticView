// Single Responsibility: JSON schema preview
'use client';

import { SchemaField } from '@/lib/types/schema.types';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SchemaPreviewProps {
  fields: SchemaField[];
  schemaName?: string;
  sourceUrl?: string;
}

export function SchemaPreview({ fields, schemaName, sourceUrl }: SchemaPreviewProps) {
  const [copied, setCopied] = useState(false);

  const generatePreview = () => {
    const sampleData: Record<string, unknown> = {};
    fields.forEach(field => {
      switch (field.data_type) {
        case 'number':
          sampleData[field.name] = 0;
          break;
        case 'currency':
          sampleData[field.name] = 0.0;
          break;
        case 'boolean':
          sampleData[field.name] = false;
          break;
        case 'date':
          sampleData[field.name] = new Date().toISOString();
          break;
        default:
          sampleData[field.name] = '';
      }
    });

    return {
      schema_version: '1.0',
      name: schemaName || 'Untitled Schema',
      source_url: sourceUrl || '',
      fields: fields.map(f => ({
        name: f.name,
        css_selector: f.css_selector,
        data_type: f.data_type,
        confidence: f.confidence,
        ...(f.currency_hint && { currency_hint: f.currency_hint }),
      })),
      sample_output: sampleData,
    };
  };

  const handleCopy = async () => {
    const preview = generatePreview();
    await navigator.clipboard.writeText(JSON.stringify(preview, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preview = generatePreview();

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-200">Schema Preview</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm text-gray-300 font-mono">
          {JSON.stringify(preview, null, 2)}
        </pre>
      </div>
    </div>
  );
}
