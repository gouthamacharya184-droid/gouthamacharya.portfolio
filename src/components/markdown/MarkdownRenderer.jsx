import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

export default function MarkdownRenderer({ content, onSelectArtifact, artifact }) {
  if (!content) return null;

  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeVal = String(children).replace(/\n$/, '');
          return !inline && match ? (
            <div className="relative group/code-wrapper">
              <CodeBlock lang={match[1]} code={codeVal} />
              {artifact && (
                <button
                  onClick={() => onSelectArtifact(artifact)}
                  className="absolute top-2 right-12 flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 hover:bg-cyan-900 px-2 py-1 rounded-lg transition-all"
                >
                  View Artifact
                </button>
              )}
            </div>
          ) : (
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-[12px] font-medium" {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3 border border-white/10 rounded-xl bg-white/[0.02]">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-white/5 border-b border-white/10 text-slate-300 font-bold">{children}</thead>;
        },
        th({ children }) {
          return <th className="p-3 font-semibold">{children}</th>;
        },
        td({ children }) {
          return <td className="p-3 border-b border-white/[0.05] text-slate-400">{children}</td>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 my-2 space-y-1 text-slate-300">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-300">{children}</ol>;
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
              {children}
            </a>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
