// Single Responsibility: Dialog for adding/editing fields
'use client';

import { useState, useEffect } from 'react';
import { SchemaField, DataType } from '@/lib/types/schema.types';
import { AISuggestion } from '@/lib/types/ai.types';
import { X, Sparkles } from 'lucide-react';

interface FieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: SchemaField) => void;
  suggestion?: AISuggestion | null;
  selector: string;
  isLoading?: boolean;
}

const DATA_TYPES: DataType[] = ['string', 'number', 'currency', 'date', 'boolean'];

export function FieldDialog({
  isOpen,
  onClose,
  onSave,
  suggestion,
  selector,
  isLoading,
}: FieldDialogProps) {
  const [fieldName, setFieldName] = useState('');
  const [dataType, setDataType] = useState<DataType>('string');
  const [currencyHint, setCurrencyHint] = useState('USD');
  const [confidence, setConfidence] = useState(0.9);

  useEffect(() => {
    if (suggestion) {
      setFieldName(suggestion.field_name);
      setDataType(suggestion.data_type as DataType);
      if (suggestion.currency_hint) {
        setCurrencyHint(suggestion.currency_hint);
      }
      if (suggestion.template_confidence) {
        setConfidence(suggestion.template_confidence);
      }
    }
  }, [suggestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const field: SchemaField = {
      name: fieldName,
      css_selector: selector,
      data_type: dataType,
      confidence,
      ...(dataType === 'currency' && { currency_hint: currencyHint }),
    };

    onSave(field);
    handleClose();
  };

  const handleClose = () => {
    setFieldName('');
    setDataType('string');
    setCurrencyHint('USD');
    setConfidence(0.9);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Field</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-3 rounded-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm">AI is analyzing the element...</span>
            </div>
          )}

          {suggestion && !isLoading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI Suggestion</span>
              </div>
              {suggestion.related_fields.length > 0 && (
                <p className="text-sm text-green-700">
                  Related fields: {suggestion.related_fields.join(', ')}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Name (snake_case)
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., product_price"
              required
              pattern="^[a-z][a-z0-9_]*$"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSS Selector
            </label>
            <input
              type="text"
              value={selector}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as DataType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {DATA_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {dataType === 'currency' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Code
              </label>
              <input
                type="text"
                value={currencyHint}
                onChange={(e) => setCurrencyHint(e.target.value)}
                placeholder="USD"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!fieldName || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
