import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, RotateCcw, GitCompare, FileCode, Edit3, Code2 } from 'lucide-react';
import { soundService } from '../services/sound';

export default function CodeEditor({
  code = '',
  originalCode = '',
  language = 'C',
  title = 'snippet',
  highlightedLines = [],
  isEditable = false,
  onChange = () => {},
  onReset = () => {}
}) {
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const baseCode = originalCode || code;
  const isModified = isEditable && code !== baseCode;

  // Calculate line count and modified line stats
  const currentLines = (code || '').split('\n');
  const baseLines = (baseCode || '').split('\n');

  // Count changed lines
  let changedLineCount = 0;
  const maxLines = Math.max(currentLines.length, baseLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (currentLines[i] !== baseLines[i]) {
      changedLineCount++;
    }
  }

  const handleCopy = () => {
    soundService.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetClick = () => {
    soundService.playClick();
    onReset();
    setShowDiff(false);
  };

  const getLanguageExt = (lang) => {
    const map = {
      'C': 'main.c',
      'C++': 'solution.cpp',
      'Java': 'BugFixer.java',
      'Python': 'script.py',
      'JavaScript': 'index.js',
      'HTML/CSS': 'style.css',
      'SQL': 'query.sql'
    };
    return map[lang] || 'solution.txt';
  };

  // Synchronize scrolling between textarea and line numbers
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Keyboard handler for Tab key and auto-indentation on Enter
  const handleKeyDown = (e) => {
    if (!isEditable) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    // Handle TAB key (insert 4 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const tabSpaces = '    '; // 4 spaces
      const newValue = value.substring(0, selectionStart) + tabSpaces + value.substring(selectionEnd);
      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + tabSpaces.length;
      }, 0);
    }

    // Handle ENTER key (match previous line indentation)
    if (e.key === 'Enter') {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      const match = currentLine.match(/^\s*/);
      const indent = match ? match[0] : '';

      if (indent.length > 0) {
        e.preventDefault();
        const insertText = '\n' + indent;
        const newValue = value.substring(0, selectionStart) + insertText + value.substring(selectionEnd);
        onChange(newValue);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + insertText.length;
        }, 0);
      }
    }
  };

  // Basic syntax coloring simulation for read-only preview
  const formatCodeLine = (line) => {
    if (!line) return <span>&nbsp;</span>;
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('--')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }

    const tokens = line.split(/(\b(?:int|float|double|char|void|if|else|for|while|return|def|function|let|const|var|class|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|GROUP|BY|ORDER|public|static|new|async|await|try|catch|finally|throw|import|from|struct|size_t|bool|true|false|null|NULL|nullptr)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+\b)/g);

    return tokens.map((token, idx) => {
      if (!token) return null;
      if (/^(int|float|double|char|void|def|function|let|const|var|class|public|static|struct|size_t|bool)$/.test(token)) {
        return <span key={idx} className="text-cyan-400 font-semibold">{token}</span>;
      }
      if (/^(if|else|for|while|return|new|async|await|try|catch|finally|throw|import|from|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|GROUP|BY|ORDER)$/.test(token)) {
        return <span key={idx} className="text-purple-400 font-semibold">{token}</span>;
      }
      if (/^(".*"|'.*')$/.test(token)) {
        return <span key={idx} className="text-emerald-400">{token}</span>;
      }
      if (/^\d+$/.test(token)) {
        return <span key={idx} className="text-amber-400">{token}</span>;
      }
      if (/^(true|false|null|NULL|nullptr)$/.test(token)) {
        return <span key={idx} className="text-rose-400 font-semibold">{token}</span>;
      }
      if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
        return <span key={idx} className="text-yellow-300">{token}</span>;
      }
      return <span key={idx} className="text-slate-200">{token}</span>;
    });
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-cyber-border bg-[#0b0f19] shadow-2xl font-mono text-xs sm:text-sm">
      
      {/* Editor Titlebar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-cyber-border select-none gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-400/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 border border-green-400/40 inline-block" />
          </div>
          <FileCode className="w-4 h-4 text-cyber-green" />
          <span className="text-slate-300 font-medium tracking-tight">
            {getLanguageExt(language)}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cyber-card border border-cyber-border text-cyber-cyan">
            {language}
          </span>

          {/* Editable Mode Status Badge */}
          {isEditable ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EDITABLE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700">
              READ-ONLY
            </span>
          )}

          {/* Modification indicator */}
          {isModified && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-500/40 text-amber-400">
              MODIFIED ({changedLineCount} {changedLineCount === 1 ? 'line' : 'lines'})
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Diff Toggle Button (if in editable mode) */}
          {isEditable && (
            <button
              onClick={() => {
                soundService.playClick();
                setShowDiff(!showDiff);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition-all ${
                showDiff
                  ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-neon-cyan'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Toggle Diff View"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{showDiff ? 'Exit Diff' : 'View Diff'}</span>
            </button>
          )}

          {/* Reset Code Button */}
          {isEditable && isModified && (
            <button
              onClick={handleResetClick}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/60 transition-all text-xs"
              title="Reset to original buggy code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyber-green" />
                <span className="text-cyber-green font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {showDiff ? (
        /* Unified Diff View */
        <div className="p-4 overflow-x-auto max-h-[480px] scrollbar-thin bg-black/40 font-mono text-xs">
          <div className="text-[11px] text-slate-400 mb-2 font-mono flex items-center justify-between border-b border-slate-800 pb-1">
            <span>DIFF: Original (red) vs Your Fix (green)</span>
            <span className="text-cyber-cyan font-bold">{changedLineCount} lines altered</span>
          </div>
          <table className="w-full border-collapse">
            <tbody>
              {Array.from({ length: Math.max(baseLines.length, currentLines.length) }).map((_, idx) => {
                const orig = baseLines[idx];
                const curr = currentLines[idx];
                const isDifferent = orig !== curr;

                if (!isDifferent) {
                  return (
                    <tr key={idx} className="hover:bg-slate-800/20 text-slate-400">
                      <td className="w-10 pr-3 text-right select-none text-slate-600 font-mono py-0.5">{idx + 1}</td>
                      <td className="w-6 text-center select-none text-slate-600 py-0.5"> </td>
                      <td className="whitespace-pre font-mono py-0.5">{orig || ''}</td>
                    </tr>
                  );
                }

                return (
                  <React.Fragment key={idx}>
                    {orig !== undefined && (
                      <tr className="bg-red-950/30 text-red-300 border-l-2 border-red-500">
                        <td className="w-10 pr-3 text-right select-none text-red-500/60 font-mono py-0.5">{idx + 1}</td>
                        <td className="w-6 text-center select-none text-red-400 font-bold py-0.5">-</td>
                        <td className="whitespace-pre font-mono py-0.5 line-through opacity-80">{orig}</td>
                      </tr>
                    )}
                    {curr !== undefined && (
                      <tr className="bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500">
                        <td className="w-10 pr-3 text-right select-none text-emerald-500/60 font-mono py-0.5">{idx + 1}</td>
                        <td className="w-6 text-center select-none text-emerald-400 font-bold py-0.5">+</td>
                        <td className="whitespace-pre font-mono py-0.5 font-medium">{curr}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : isEditable ? (
        /* Interactive Code Editor (Editable Mode) */
        <div className="relative flex min-h-[360px] max-h-[500px] overflow-hidden bg-[#070b14]">
          {/* Synchronized Line Numbers */}
          <div
            ref={lineNumbersRef}
            className="w-12 py-3 pr-3 text-right select-none text-slate-600 font-mono text-xs bg-slate-950/60 border-r border-slate-800/80 overflow-hidden leading-6"
          >
            {currentLines.map((_, idx) => {
              const lineNum = idx + 1;
              const isChanged = baseLines[idx] !== currentLines[idx];
              return (
                <div
                  key={idx}
                  className={`h-6 ${isChanged ? 'text-amber-400 font-bold' : ''}`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>

          {/* Editable Text Area */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="// Type and fix the code directly here..."
            className="flex-1 p-3 bg-transparent text-emerald-200 font-mono text-xs sm:text-sm resize-none outline-none leading-6 whitespace-pre overflow-auto scrollbar-thin selection:bg-cyber-green/30"
            style={{ tabSize: 4 }}
          />
        </div>
      ) : (
        /* Read-Only Mode (Round 1 & Inspection) */
        <div className="p-4 overflow-x-auto max-h-[480px] scrollbar-thin">
          <table className="w-full border-collapse">
            <tbody>
              {currentLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = highlightedLines.includes(lineNum);
                return (
                  <tr
                    key={idx}
                    className={`group transition-colors ${
                      isHighlighted ? 'bg-cyber-green/10 border-l-2 border-cyber-green' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="w-10 pr-4 text-right select-none text-slate-600 group-hover:text-slate-400 font-mono text-xs align-top py-0.5">
                      {lineNum}
                    </td>
                    <td className="whitespace-pre font-mono py-0.5 text-slate-200">
                      {formatCodeLine(line)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Status Footer in Editable Mode */}
      {isEditable && (
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>{currentLines.length} lines</span>
            <span>•</span>
            <span className="text-slate-500">Tab: 4 spaces</span>
            <span>•</span>
            <span className="text-slate-500">Auto-indent enabled</span>
          </div>
          <div className="flex items-center gap-2">
            {isModified ? (
              <span className="text-amber-400 font-medium">Ready to submit fix</span>
            ) : (
              <span className="text-slate-500">Edit buggy lines above</span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
