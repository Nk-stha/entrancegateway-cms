'use client';

import { useState } from 'react';

export interface MathToolbarProps {
  onInsert: (latex: string) => void;
}

const CATEGORIES = [
  {
    label: 'Trigonometry',
    color: '#6366f1',
    symbols: [
      { display: 'sin', latex: '\\sin' },
      { display: 'cos', latex: '\\cos' },
      { display: 'tan', latex: '\\tan' },
      { display: 'cot', latex: '\\cot' },
      { display: 'sec', latex: '\\sec' },
      { display: 'csc', latex: '\\csc' },
      { display: 'sin⁻¹', latex: '\\sin^{-1}' },
      { display: 'cos⁻¹', latex: '\\cos^{-1}' },
      { display: 'tan⁻¹', latex: '\\tan^{-1}' },
    ],
  },
  {
    label: 'Greek',
    color: '#8b5cf6',
    symbols: [
      { display: 'α', latex: '\\alpha' },
      { display: 'β', latex: '\\beta' },
      { display: 'γ', latex: '\\gamma' },
      { display: 'δ', latex: '\\delta' },
      { display: 'ε', latex: '\\epsilon' },
      { display: 'θ', latex: '\\theta' },
      { display: 'λ', latex: '\\lambda' },
      { display: 'μ', latex: '\\mu' },
      { display: 'π', latex: '\\pi' },
      { display: 'σ', latex: '\\sigma' },
      { display: 'φ', latex: '\\phi' },
      { display: 'ω', latex: '\\omega' },
    ],
  },
  {
    label: 'Calculus',
    color: '#0ea5e9',
    symbols: [
      { display: '∫', latex: '\\int' },
      { display: '∫ₐᵇ', latex: '\\int_{a}^{b}' },
      { display: '∂', latex: '\\partial' },
      { display: '∇', latex: '\\nabla' },
      { display: 'lim', latex: '\\lim_{x \\to a}' },
      { display: 'Σᵢ', latex: '\\sum_{i=1}^{n}' },
      { display: 'd/dx', latex: '\\frac{d}{dx}' },
      { display: '∂/∂x', latex: '\\frac{\\partial}{\\partial x}' },
    ],
  },
  {
    label: 'Algebra',
    color: '#10b981',
    symbols: [
      { display: 'x²', latex: 'x^{2}' },
      { display: 'xⁿ', latex: 'x^{n}' },
      { display: '√', latex: '\\sqrt{x}' },
      { display: 'ⁿ√', latex: '\\sqrt[n]{x}' },
      { display: 'a/b', latex: '\\frac{a}{b}' },
      { display: '±', latex: '\\pm' },
      { display: '×', latex: '\\times' },
      { display: '÷', latex: '\\div' },
      { display: '≈', latex: '\\approx' },
      { display: '≠', latex: '\\neq' },
      { display: '≤', latex: '\\leq' },
      { display: '≥', latex: '\\geq' },
      { display: '∞', latex: '\\infty' },
    ],
  },
  {
    label: 'Logarithms',
    color: '#f59e0b',
    symbols: [
      { display: 'log', latex: '\\log' },
      { display: 'ln', latex: '\\ln' },
      { display: 'log₁₀', latex: '\\log_{10}' },
      { display: 'eˣ', latex: 'e^{x}' },
      { display: 'exp', latex: '\\exp' },
    ],
  },
  {
    label: 'Sets',
    color: '#ec4899',
    symbols: [
      { display: '∈', latex: '\\in' },
      { display: '∉', latex: '\\notin' },
      { display: '⊂', latex: '\\subset' },
      { display: '∪', latex: '\\cup' },
      { display: '∩', latex: '\\cap' },
      { display: '∅', latex: '\\emptyset' },
      { display: '∀', latex: '\\forall' },
      { display: '∃', latex: '\\exists' },
      { display: 'ℝ', latex: '\\mathbb{R}' },
      { display: 'ℤ', latex: '\\mathbb{Z}' },
      { display: 'ℕ', latex: '\\mathbb{N}' },
    ],
  },
];

export function MathToolbar({ onInsert }: MathToolbarProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [insertMode, setInsertMode] = useState<'inline' | 'block'>('inline');

  const handleSymbolClick = (latex: string) => {
    const wrapped = insertMode === 'inline' ? `$${latex}$` : `$$${latex}$$`;
    onInsert(wrapped);
  };

  const currentCategory = CATEGORIES[activeCategory];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
        {CATEGORIES.map((cat, index) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setActiveCategory(index)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeCategory === index ? 'border-current' : 'border-transparent text-gray-500'
            }`}
            style={{
              color: activeCategory === index ? cat.color : undefined,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="p-3 flex flex-wrap gap-2">
        {currentCategory.symbols.map((symbol, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSymbolClick(symbol.latex)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:border-current hover:bg-gray-50 transition-colors font-mono"
            style={{
              color: currentCategory.color,
            }}
            title={symbol.latex}
          >
            {symbol.display}
          </button>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500">Insert mode:</span>
        <button
          type="button"
          onClick={() => setInsertMode('inline')}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
            insertMode === 'inline'
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-300 text-gray-600'
          }`}
        >
          $...$ Inline
        </button>
        <button
          type="button"
          onClick={() => setInsertMode('block')}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
            insertMode === 'block'
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-300 text-gray-600'
          }`}
        >
          $$...$$ Block
        </button>
      </div>
    </div>
  );
}
