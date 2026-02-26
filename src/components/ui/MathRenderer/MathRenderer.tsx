'use client';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
}

function SafeMath({ math, block }: { math: string; block?: boolean }) {
  try {
    return block ? <BlockMath math={math} /> : <InlineMath math={math} />;
  } catch (e) {
    return <span className="text-red-500">[Invalid math: {math}]</span>;
  }
}

export function MathRenderer({ text }: MathRendererProps) {
  if (!text) return null;

  // Split on $$...$$ (block) and $...$ (inline)
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <SafeMath key={i} math={part.slice(2, -2)} block />;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <SafeMath key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
