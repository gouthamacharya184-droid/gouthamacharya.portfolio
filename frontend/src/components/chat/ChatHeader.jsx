import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Sparkles, Plus, Trash2, Download, Sliders, Minimize2, X, Menu, RefreshCw
} from 'lucide-react';
import { useChatContext } from '../../hooks/useChat';

function StatusDot({ status }) {
  const colors = {
    online: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    offline: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    checking: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  };
  return (
    <span className={`inline-block rounded-full h-2 w-2 ${colors[status] ?? colors.checking} ${status !== 'offline' ? 'animate-pulse' : ''}`} />
  );
}

function VoiceWaveform() {
  return (
    <div className="flex items-center gap-[3px] h-3 px-1.5">
      {[0.5, 0.9, 0.4, 0.7, 0.2, 0.8, 0.5].map((scale, i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-cyan-400 rounded-full"
          style={{ height: '100%' }}
          animate={{ scaleY: [0.3, scale, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function ChatHeader({
  sidebarOpen, setSidebarOpen,
  aiStatus: propAiStatus, speakingMsgId, onNewChat, onClear, onExport,
  onMinimize, onClose, onSettings
}) {
  let chatCtx = null;
  try {
    chatCtx = useChatContext();
  } catch {
    // Graceful fallback if rendered outside ChatProvider
  }
  const aiStatus = propAiStatus ?? chatCtx?.aiStatus ?? 'checking';
  const recheckStatus = chatCtx?.recheckStatus;

  return (
    <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 border-b border-white/[0.05] bg-[#03050a]/80 backdrop-blur-xl relative z-40">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/5 border border-white/[0.06] transition-all cursor-pointer"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <Menu size={15} />
            </motion.button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/20 flex items-center justify-center">
              <Bot size={16} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[13px] font-bold text-white tracking-tight">Portfolio AI</h1>
                <Sparkles size={11} className="text-cyan-400 opacity-60" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-white/5">
            <StatusDot status={aiStatus} />
            <span className={`text-[10px] uppercase tracking-wider font-bold ${
              aiStatus === 'online' ? 'text-emerald-400' : aiStatus === 'offline' ? 'text-rose-400' : 'text-amber-400 animate-pulse'
            }`}>
              {aiStatus === 'online' ? 'Online' : aiStatus === 'offline' ? 'Offline' : 'Connecting…'}
            </span>
            {recheckStatus && (
              <button
                onClick={recheckStatus}
                className="p-1 text-slate-500 hover:text-cyan-400 transition-colors rounded-lg cursor-pointer"
                title="Recheck connection status"
              >
                <RefreshCw size={11} className={aiStatus === 'checking' ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>

      <div className="flex items-center gap-1.5">
        {speakingMsgId && <VoiceWaveform />}

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onNewChat}
          className="flex items-center justify-center gap-1.5 h-8 w-8 md:w-auto md:px-3 rounded-xl text-[12px] text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-all font-medium cursor-pointer"
          title="New Chat"
        >
          <Plus size={13} /> <span className="hidden md:inline">New Chat</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="flex items-center justify-center gap-1.5 h-8 w-8 md:w-auto md:px-3 rounded-xl text-[12px] text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-all font-medium cursor-pointer"
          title="Clear History"
        >
          <Trash2 size={13} /> <span className="hidden md:inline">Clear</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onExport}
          className="flex items-center justify-center gap-1.5 h-8 w-8 md:w-auto md:px-3 rounded-xl text-[12px] text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-all font-medium cursor-pointer"
          title="Export Conversation"
        >
          <Download size={13} /> <span className="hidden md:inline">Export</span>
        </motion.button>
        {onSettings && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/[0.06] cursor-pointer"
            title="Settings"
          >
            <Sliders size={14} />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onMinimize}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all border border-white/[0.06] cursor-pointer"
          title="Minimize to widget"
        >
          <Minimize2 size={15} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/10 transition-all border border-white/[0.06] cursor-pointer"
          title="Close"
        >
          <X size={16} />
        </motion.button>
      </div>
    </div>
  );
}
