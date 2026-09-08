import React from 'react';
import { Terminal, Code, Copy, Check } from 'lucide-react';

export const CodeViewer = ({
  code = '',
  language = 'C',
  highlightLines = [],
  onLineClick = null,
  selectedLines = []
}) => {
  const lines = code.split('\n');

  // Simple token highlighter helper for common syntax
  const renderHighlightedLine = (line) => {
    // Quick regex based tokenization for presentation
    // Comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#') && !line.includes('<')) {
      return <span className="code-token-comment">{line}</span>;
    }

    // Split words and match keywords
    const keywords = ['int', 'char', 'float', 'double', 'void', 'for', 'while', 'if', 'else', 'return', 'class', 'public', 'private', 'static', 'async', 'await', 'def', 'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'delete', 'new', 'struct'];
    
    // Replace strings with span
    const parts = line.split(/(".*?"|'.*?'|\b[a-zA-Z_]\w*\b|\d+|[{}();,<>+\-*\/=&|!])/g);

    return parts.map((token, idx) => {
      if (!token) return null;
      if (token.startsWith('"') || token.startsWith("'")) {
        return <span key={idx} className="code-token-string">{token}</span>;
      }
      if (/^\d+$/.test(token)) {
        return <span key={idx} className="code-token-number">{token}</span>;
      }
      if (keywords.includes(token)) {
        return <span key={idx} className="code-token-keyword">{token}</span>;
      }
      if (['printf', 'cout', 'println', 'print', 'console.log', 'malloc', 'free'].includes(token)) {
        return <span key={idx} className="code-token-function">{token}</span>;
      }
      return <span key={idx} className="text-slate-200">{token}</span>;
    });
  };

  return (
    <div className="rounded-xl border border-cyber-border bg-[#0b1120] overflow-hidden shadow-2xl font-mono text-xs sm:text-sm no-select">
      
      {/* Code Editor Header */}
      <div className="bg-[#0f172a] border-b border-cyber-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>bug_hunt_target.{language.toLowerCase().replace('/', '')}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyber-surface border border-slate-700 text-cyber-cyan">
            {language}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            UTF-8
          </span>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="overflow-x-auto max-h-[420px] p-3 leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isSelected = selectedLines.includes(lineNum);
              const isHighlighted = highlightLines.includes(lineNum);

              return (
                <tr
                  key={idx}
                  onClick={() => onLineClick && onLineClick(lineNum)}
                  className={`group transition-colors ${
                    onLineClick ? 'cursor-pointer hover:bg-slate-800/60' : ''
                  } ${
                    isSelected
                      ? 'bg-rose-950/40 border-l-2 border-rose-500'
                      : isHighlighted
                      ? 'bg-amber-950/30'
                      : ''
                  }`}
                >
                  {/* Line Number Gutter */}
                  <td className="w-12 text-right pr-4 text-slate-600 group-hover:text-slate-400 select-none text-[11px] font-mono">
                    {lineNum}
                  </td>

                  {/* Line Content */}
                  <td className="whitespace-pre text-slate-200 font-mono py-0.5">
                    {renderHighlightedLine(lineText)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="bg-[#0f172a]/80 border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>{lines.length} lines</span>
        <span className="text-slate-400 font-mono">
          {onLineClick ? 'Click any line to flag or inspect' : 'Target Source Code'}
        </span>
      </div>

    </div>
  );
};
