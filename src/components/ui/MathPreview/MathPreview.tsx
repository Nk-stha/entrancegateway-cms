'use client';

import { MathRenderer } from '@/components/ui/MathRenderer';

interface MathPreviewProps {
  text: string;
}

export function MathPreview({ text }: MathPreviewProps) {
  if (!text) {
    return (
      <div className="p-3 border border-gray-200 rounded bg-gray-50">
        <p className="text-xs text-gray-400 mb-2">Preview</p>
        <p className="text-sm text-gray-400 italic">Type to see preview...</p>
      </div>
    );
  }

  return (
    <div className="p-3 border border-gray-200 rounded bg-gray-50">
      <p className="text-xs text-gray-400 mb-2">Preview</p>
      <div className="text-sm text-gray-900">
        <MathRenderer text={text} />
      </div>
    </div>
  );
}
