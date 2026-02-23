// Main application page - Composition of components following SOLID principles
'use client';

import { useState } from 'react';
import { URLInput } from '@/components/URLInput';
import { PageInspector } from '@/components/PageInspector';
import { FieldList } from '@/components/FieldList';
import { SchemaPreview } from '@/components/SchemaPreview';
import { FieldDialog } from '@/components/FieldDialog';
import { SchemaActions } from '@/components/SchemaActions';
import { useSchemaBuilder, SelectedElement } from '@/lib/hooks/useSchemaBuilder';
import { AISuggestion } from '@/lib/types/ai.types';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const {
    fields,
    currentUrl,
    schemaName,
    isLoading,
    setCurrentUrl,
    setSchemaName,
    addField,
    removeField,
    getSuggestion,
    saveSchema,
    reset,
  } = useSchemaBuilder();

  const [isInspectorVisible, setIsInspectorVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUrlSubmit = (url: string) => {
    setCurrentUrl(url);
    setIsInspectorVisible(true);
  };

  const handleElementSelected = async (element: SelectedElement) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
    setAiSuggestion(null);

    const suggestion = await getSuggestion(element);
    if (suggestion) {
      setAiSuggestion(suggestion);
    }
  };

  const handleSaveSchema = async () => {
    if (!schemaName.trim()) {
      alert('Please enter a schema name');
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveSchema();
      alert(`Schema saved successfully! ID: ${result.data.schema_id}`);
    } catch (error) {
      alert(`Failed to save schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (fields.length === 0) return;

    const exportData = {
      schema_version: '1.0',
      name: schemaName || 'Untitled Schema',
      source_url: currentUrl,
      fields,
      sample_output: fields.reduce((acc, field) => {
        acc[field.name] = null;
        return acc;
      }, {} as Record<string, unknown>),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schemaName.replace(/\s+/g, '_').toLowerCase() || 'schema'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (fields.length > 0) {
      if (!confirm('Are you sure you want to reset? All fields will be lost.')) {
        return;
      }
    }
    reset();
    setIsInspectorVisible(false);
    setSelectedElement(null);
    setAiSuggestion(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AgenticView</h1>
            </div>
            <span className="text-sm text-gray-500">
              Create APIs for AI to extract data from any webpage
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* URL Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Enter Website URL
            </h2>
            <URLInput onSubmit={handleUrlSubmit} disabled={isLoading} />
          </div>

          {/* Schema Name Input */}
          {isInspectorVisible && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Name Your Schema
              </h2>
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                placeholder="e.g., Amazon Product Page"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          {/* Main Workspace */}
          {isInspectorVisible && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Inspector */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Step 3: Select Elements
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Click on any element in the page below to add it as a field
                  </p>
                  <div className="h-[600px]">
                    <PageInspector
                      url={currentUrl}
                      onElementSelected={handleElementSelected}
                    />
                  </div>
                </div>
              </div>

              {/* Right Panel: Fields & Preview */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Selected Fields ({fields.length})
                  </h2>
                  <div className="max-h-[300px] overflow-y-auto">
                    <FieldList fields={fields} onRemove={removeField} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Schema Preview
                  </h2>
                  <div className="h-[300px]">
                    <SchemaPreview
                      fields={fields}
                      schemaName={schemaName}
                      sourceUrl={currentUrl}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Step 4: Save or Export
                  </h2>
                  <SchemaActions
                    onSave={handleSaveSchema}
                    onExport={handleExport}
                    onReset={handleReset}
                    disabled={isSaving}
                    hasFields={fields.length > 0}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Field Dialog */}
      <FieldDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={addField}
        suggestion={aiSuggestion}
        selector={selectedElement?.selector || ''}
        isLoading={isLoading}
      />
    </div>
  );
}
