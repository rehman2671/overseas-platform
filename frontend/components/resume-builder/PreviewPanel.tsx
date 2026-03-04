import React from 'react';

interface PreviewPanelProps {
  data: any;
}

export default function PreviewPanel({ data }: PreviewPanelProps) {
  // simple JSON dump for now; later convert to formatted resume view
  return (
    <div className="border-l pl-6 max-h-[80vh] overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Preview</h3>
      <pre className="text-xs text-gray-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
