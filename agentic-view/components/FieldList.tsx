// Single Responsibility: Display and manage field list
'use client';

import { SchemaField } from '@/lib/types/schema.types';
import { Trash2, Edit2 } from 'lucide-react';

interface FieldListProps {
  fields: SchemaField[];
  onRemove: (fieldName: string) => void;
  onEdit?: (field: SchemaField) => void;
}

export function FieldList({ fields, onRemove, onEdit }: FieldListProps) {
  if (fields.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No fields yet</p>
        <p className="text-sm mt-2">Click on elements in the page to add fields</p>
      </div>
    );
  }

  const getDataTypeColor = (dataType: string) => {
    const colors: Record<string, string> = {
      string: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      currency: 'bg-yellow-100 text-yellow-800',
      date: 'bg-purple-100 text-purple-800',
      boolean: 'bg-pink-100 text-pink-800',
    };
    return colors[dataType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div
          key={`${field.name}-${index}`}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900">{field.name}</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDataTypeColor(field.data_type)}`}>
                  {field.data_type}
                </span>
                {field.currency_hint && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {field.currency_hint}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 font-mono break-all">
                {field.css_selector}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Confidence: {(field.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              {onEdit && (
                <button
                  onClick={() => onEdit(field)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit field"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onRemove(field.name)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
