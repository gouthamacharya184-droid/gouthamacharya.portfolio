import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Zap } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 5000;

export default function ChatInput({ onSend, isTyping, fullscreen = false, placeholder = 'Message Portfolio AI…' }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const ref = useRef(null);

  // Keep focused: refocus on mount & after AI completes typing
  useEffect(() => {
    const t = setTimeout(() => {
      if (ref.current) ref.current.focus();
    }, 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isTyping && ref.current) {
      setTimeout(() => ref.current?.focus(), 80);
    }
  }, [isTyping]);

  const focusInput = () => {
    if (ref.current) ref.current.focus();
  };

  const submit = () => {
    const t = text.trim();
    if (!t || isTyping) return;
    onSend(t);
    setText('');
    if (ref.current) {
      ref.current.style.height = 'auto';
      setTimeout(() => ref.current?.focus(), 30);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = text.trim().length > 0 && !isTyping;

  return (
    <div className={`w-full ${fullscreen ? 'max-w-3xl mx-auto' : ''}`}>
      <div
        className={`relative rounded-xl border transition-all duration-300 ${
          isFocused
            ? 'border-cyan-500/50 bg-[#02050b]/95 shadow-[0_0_24px_rgba(34,211,238,0.16)] ring-1 ring-cyan-500/20'
            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
        }`}
      >
        <div className="flex items-end gap-3 px-4 py-2.5">
          <textarea
            ref={ref}
            id="chatbot-input"
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value.slice(0, MAX_MESSAGE_LENGTH));
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
            onKeyDown={onKey}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            aria-label="Chat message input"
            autoComplete="off"
            spellCheck="true"
            className="flex-1 bg-transparent text-[14px] text-white placeholder:text-slate-500 resize-none outline-none border-none focus:ring-0 focus:outline-none leading-relaxed py-1.5"
            style={{ minHeight: 24, maxHeight: 140, overflowY: 'auto' }}
          />

          <div className="flex items-center gap-2 mb-1">

            <button
              id="chatbot-send"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                canSend
                  ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-95 shadow-[0_0_12px_rgba(34,211,238,0.35)] cursor-pointer'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isTyping ? (
                <Zap size={14} className="text-cyan-400 animate-pulse" />
              ) : (
                <ArrowUp size={14} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
