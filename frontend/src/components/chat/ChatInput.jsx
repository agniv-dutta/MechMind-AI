import React, { useState, useRef } from 'react';
import { Send, Paperclip, Loader2, X } from 'lucide-react';
import { validateChatInput, SUPPORTED_UPLOAD_EXTENSIONS } from '../../utils/validators.js';

export function ChatInput({ onSend, loading = false }) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState(null);
  const ref = useRef(null);

  const send = () => {
    const e = validateChatInput(input);
    if (e) {
      setErr(e);
      return;
    }
    setErr(null);
    onSend(input, files);
    setInput('');
    setFiles([]);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-teal-500/10 p-4 space-y-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-1">
              {f.name}
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove file">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button onClick={() => ref.current?.click()} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg" title="Attach documents">
          <Paperclip className="w-4 h-4 text-slate-500" />
        </button>
        <input
          ref={ref}
          type="file"
          multiple
          className="hidden"
          accept={SUPPORTED_UPLOAD_EXTENSIONS.join(',')}
          onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])}
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !loading) send();
          }}
          placeholder="Ask about equipment, procedures, or manuals… (Ctrl+Enter to send)"
          rows={3}
          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-teal-500/20 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="self-end px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:bg-slate-300 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
