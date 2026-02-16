import { useState } from 'react';

export interface MarkdownTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function MarkdownTextarea({
  label,
  error,
  helperText,
  className = '',
  id,
  value = '',
  onChange,
  ...props
}: MarkdownTextareaProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaId = id || `markdown-textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const textValue = String(value || '');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textValue.substring(start, end);
    const newText = textValue.substring(0, start) + before + selectedText + after + textValue.substring(end);
    
    if (onChange) {
      onChange({ target: { value: newText } } as any);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const renderMarkdown = (text: string): string => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2" style="color: var(--color-brand-navy)">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2" style="color: var(--color-brand-navy)">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2" style="color: var(--color-brand-navy)">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-blue underline hover:text-brand-navy" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded-lg" />');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" style="color: var(--color-brand-navy)">$1</code>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-2"><code class="text-sm font-mono">$1</code></pre>');

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 pl-4 py-2 my-2 italic text-gray-600" style="border-color: var(--color-brand-blue)">$1</blockquote>');
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 pl-4 py-2 my-2 italic text-gray-600" style="border-color: var(--color-brand-blue)">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-4 border-gray-300" />');
    html = html.replace(/^\*\*\*$/gim, '<hr class="my-4 border-gray-300" />');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li class="ml-4">[\s\S]*<\/li>)/g, '<ul class="list-disc list-inside my-2">$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');

    // Line breaks
    html = html.replace(/  \n/g, '<br />');
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-bold uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-brand-navy)' }}
        >
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
        <button
          type="button"
          onClick={() => insertMarkdown('# ', '')}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('## ', '')}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('### ', '')}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-2 hover:bg-gray-200 rounded font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="p-2 hover:bg-gray-200 rounded italic"
          title="Italic"
        >
          I
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => insertMarkdown('[', '](url)')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('![alt](', ')')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => insertMarkdown('- ', '')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('1. ', '')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('`', '`')}
          className="p-2 hover:bg-gray-200 rounded text-sm font-mono"
          title="Inline Code"
        >
          {'<>'}
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('```\n', '\n```')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Code Block"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('> ', '')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Quote"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('\n---\n', '')}
          className="p-2 hover:bg-gray-200 rounded text-sm"
          title="Horizontal Rule"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 rounded text-sm ${!showPreview ? 'bg-brand-blue text-white' : 'hover:bg-gray-200'}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 rounded text-sm ${showPreview ? 'bg-brand-blue text-white' : 'hover:bg-gray-200'}`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      {!showPreview ? (
        <textarea
          id={textareaId}
          value={value}
          onChange={onChange}
          className={`
            block w-full px-4 py-2.5 bg-white border-2 rounded-b-lg
            text-gray-900 transition-colors outline-none resize-y font-mono text-sm
            ${className}
          `.replace(/\s+/g, ' ').trim()}
          style={{
            borderColor: error ? 'var(--color-error)' : 'var(--color-gray-300)',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--color-brand-blue)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--color-gray-300)';
            }
          }}
          {...props}
        />
      ) : (
        <div
          className="block w-full px-4 py-2.5 bg-white border-2 rounded-b-lg min-h-[200px] overflow-auto"
          style={{
            borderColor: 'var(--color-gray-300)',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(String(value || '')) }}
        />
      )}

      {error && (
        <p 
          className="mt-2 text-sm" 
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
