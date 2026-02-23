// Custom hook for schema building logic (Single Responsibility)
'use client';

import { useState, useCallback } from 'react';
import { SchemaField } from '../types/schema.types';
import { AISuggestion } from '../types/ai.types';

export interface SelectedElement {
  selector: string;
  text: string;
  html: string;
  tagName: string;
}

export function useSchemaBuilder() {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [schemaName, setSchemaName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addField = useCallback((field: SchemaField) => {
    setFields(prev => [...prev, field]);
  }, []);

  const removeField = useCallback((fieldName: string) => {
    setFields(prev => prev.filter(f => f.name !== fieldName));
  }, []);

  const updateField = useCallback((fieldName: string, updates: Partial<SchemaField>) => {
    setFields(prev =>
      prev.map(f => (f.name === fieldName ? { ...f, ...updates } : f))
    );
  }, []);

  const getSuggestion = useCallback(async (element: SelectedElement): Promise<AISuggestion | null> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element_html: element.html,
          element_text: element.text,
          current_fields: fields.map(f => f.name),
        }),
      });

      const data = await response.json();
      return data.success ? data.suggestion : null;
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fields]);

  const saveSchema = useCallback(async () => {
    if (!schemaName || !currentUrl || fields.length === 0) {
      throw new Error('Schema name, URL, and at least one field are required');
    }

    const sampleOutput: Record<string, unknown> = {};
    fields.forEach(field => {
      sampleOutput[field.name] = null;
    });

    const response = await fetch('/api/v1/schemas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: schemaName,
        source_url: currentUrl,
        fields,
        sample_output: sampleOutput,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save schema');
    }

    return await response.json();
  }, [schemaName, currentUrl, fields]);

  const reset = useCallback(() => {
    setFields([]);
    setCurrentUrl('');
    setSchemaName('');
  }, []);

  return {
    fields,
    currentUrl,
    schemaName,
    isLoading,
    setCurrentUrl,
    setSchemaName,
    addField,
    removeField,
    updateField,
    getSuggestion,
    saveSchema,
    reset,
  };
}
