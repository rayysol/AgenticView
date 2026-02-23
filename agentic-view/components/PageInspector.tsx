// Single Responsibility: Iframe-based page inspector
'use client';

import { useEffect, useRef } from 'react';
import { SelectedElement } from '@/lib/hooks/useSchemaBuilder';

interface PageInspectorProps {
  url: string;
  onElementSelected: (element: SelectedElement) => void;
}

export function PageInspector({ url, onElementSelected }: PageInspectorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_SELECTED') {
        onElementSelected(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementSelected]);

  const proxyUrl = `/api/v1/proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 ml-4 text-sm text-gray-600 truncate">
          {url}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        className="w-full h-[calc(100%-48px)] border-0"
        sandbox="allow-scripts allow-same-origin"
        title="Page Inspector"
      />
    </div>
  );
}
