// Single Responsibility: Schema action buttons
'use client';

import { Save, Download, Trash2 } from 'lucide-react';

interface SchemaActionsProps {
  onSave: () => void;
  onExport?: () => void;
  onReset: () => void;
  disabled?: boolean;
  hasFields: boolean;
}

export function SchemaActions({
  onSave,
  onExport,
  onReset,
  disabled,
  hasFields,
}: SchemaActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onSave}
        disabled={disabled || !hasFields}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Save className="w-5 h-5" />
        Save Schema
      </button>

      {onExport && (
        <button
          onClick={onExport}
          disabled={disabled || !hasFields}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      )}

      <button
        onClick={onReset}
        disabled={disabled}
        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 className="w-5 h-5" />
        Reset
      </button>
    </div>
  );
}
