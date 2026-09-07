import React, { useState } from 'react';
import { Copy } from 'lucide-react';

export function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
          AI
        </div>
      )}
      <div
        className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed ${
          isUser
            ? 'bg-teal-600 text-white ml-8'
            : 'bg-white text-slate-900 border border-slate-200'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.citations?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sources</p>
            {message.citations.map((c, i) => (
              <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold">{c.sourceDoc} · Page {c.page}</div>
                <div className="opacity-80 mt-0.5 line-clamp-2">“{c.excerpt}”</div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: `${Math.round((c.confidence || 0) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isUser && (
          <button onClick={copy} className="mt-2 text-[11px] px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center gap-1">
            <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
