import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, User, Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown
} from 'lucide-react';
import MarkdownRenderer from '../markdown/MarkdownRenderer';
import TypingIndicator from './TypingIndicator';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function MessageBubble({
  msg,
  fullscreen = false,
  isLast = false,
  speakingMsgId = null,
  onToggleSpeech = null,
  onSelectArtifact = null,
  activeArtifact = null
}) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);
  const isSpeaking = speakingMsgId === msg.id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`flex gap-3 items-start ${isUser ? 'justify-end' : 'justify-start'} ${
        fullscreen ? 'max-w-3xl mx-auto w-full' : 'w-full'
      }`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-400/20 flex items-center justify-center mt-5 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
        >
          <Bot size={16} className="text-cyan-400" />
        </motion.div>
      )}

      <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'} max-w-[78%] relative group/bubble-wrapper`}>
        <div className="flex items-center gap-2 px-1">
          {!isUser && (
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Portfolio AI</span>
          )}
          <span className="text-[10px] text-slate-600 font-mono tabular-nums">
            {formatTime(msg.timestamp || Date.now())}
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.001 }}
          className={`relative group px-5 py-3.5 text-[14px] leading-relaxed break-words shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-slate-950 font-semibold rounded-[20px] rounded-br-[4px] shadow-[0_4px_20px_rgba(34,211,238,0.15)] whitespace-pre-wrap'
              : 'bg-white/[0.03] border border-white/[0.06] text-slate-100 rounded-[20px] rounded-bl-[4px] backdrop-blur-xl hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 w-full shadow-[0_4px_30px_rgba(0,0,0,0.15)]'
          }`}
        >
          {msg.content ? (
            isUser ? (
              msg.content
            ) : (
              <MarkdownRenderer
                content={msg.content}
                onSelectArtifact={onSelectArtifact}
                artifact={activeArtifact}
              />
            )
          ) : (
            <TypingIndicator />
          )}

          {!isUser && msg.content && (
            <div className="absolute -right-10 top-1.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.button
                whileHover={{ scale: 1.15 }}
                onClick={handleCopy}
                className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-400/30 transition-all cursor-pointer"
                aria-label="Copy message"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </motion.button>
              {onToggleSpeech && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  onClick={() => onToggleSpeech(msg.id, msg.content)}
                  className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/30'
                  }`}
                  aria-label={isSpeaking ? 'Stop speech' : 'Speak message'}
                >
                  {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {!isUser && isLast && msg.content && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1 ml-1"
          >
            <button
              onClick={() => setLiked(true)}
              className={`h-6 w-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                liked === true
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
              }`}
              aria-label="Like response"
            >
              <ThumbsUp size={11} />
            </button>
            <button
              onClick={() => setLiked(false)}
              className={`h-6 w-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                liked === false
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
              }`}
              aria-label="Dislike response"
            >
              <ThumbsDown size={11} />
            </button>
          </motion.div>
        )}
      </div>

      {isUser && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center mt-5"
        >
          <User size={14} className="text-slate-300" />
        </motion.div>
      )}
    </motion.div>
  );
}
