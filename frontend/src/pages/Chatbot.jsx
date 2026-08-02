import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Plus, Maximize2 } from 'lucide-react';
import { useChatContext } from '../hooks/useChat';
import { useSpeech } from '../hooks/useSpeech';

import ChatLayout from '../layouts/ChatLayout';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import EmptyState from '../components/chat/EmptyState';

// ── Minimal preference store (only 2 settings — replaces 10 KB chatStorage.js)─
const PREF_KEY = 'portfolio_prefs_v1';

function loadPrefs(defaultBaseUrl) {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { baseUrl: defaultBaseUrl, speechRate: 1.0, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { baseUrl: defaultBaseUrl, speechRate: 1.0 };
}

function savePrefs(prefs) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
}

export default function ChatbotPage({ apiBaseUrl }) {
  // In production: apiBaseUrl = VITE_API_BASE_URL (the Render backend URL).
  // In development: apiBaseUrl = "" and Vite proxy handles /api/* routes.
  // NEVER fall back to window.location.origin (Vercel domain) — that would
  // route API calls to the frontend host instead of the backend.
  const defaultBaseUrl = (apiBaseUrl ?? "").replace(/\/$/, "");
  const [preferences, setPreferences] = useState(() => loadPrefs(defaultBaseUrl));

  const baseUrl = preferences.baseUrl;
  const speechRate = preferences.speechRate;

  const setBaseUrl = useCallback((url) => {
    setPreferences(prev => { const n = { ...prev, baseUrl: url }; savePrefs(n); return n; });
  }, []);

  const setSpeechRate = useCallback((rate) => {
    setPreferences(prev => { const n = { ...prev, speechRate: rate }; savePrefs(n); return n; });
  }, []);

  // ── Context ─────────────────────────────────────────────────────────────────
  const {
    sessions,
    activeSessionId,
    messages,
    handleNewChat,
    handleSelectSession,
    handleDeleteSession,
    handlePinSession,
    handleClear,
    isTyping,
    handleSend,
    aiStatus,
    recheckStatus,
    telemetryLogs,
    setTelemetryLogs,
    activeArtifact,
    setActiveArtifact,
  } = useChatContext();

  const { speakingMsgId, handleToggleSpeech, stopSpeech } = useSpeech();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Widget scroll
  const widgetScrollRef = useRef(null);
  const scrollToWidgetBottom = useCallback(() => {
    widgetScrollRef.current?.scrollTo({ top: widgetScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen && !isFullscreen) scrollToWidgetBottom();
  }, [messages, isTyping, isOpen, isFullscreen, scrollToWidgetBottom]);

  // Bug #3 Fix: The 60-second polling useEffect that lived here has been removed.
  // aiStatus is now managed centrally in ChatProvider (useChat.jsx) and
  // consumed via context above, eliminating the duplicate API request on mount.

  // Unread badge
  useEffect(() => {
    if (!isOpen && !isFullscreen) {
      const last = messages[messages.length - 1];
      const hasUserInteracted = messages.some(m => m.role === 'user');
      if (last?.role === 'bot' && last.content && hasUserInteracted) {
        setUnread(n => Math.min(n + 1, 9));
      }
    }
  }, [messages, isOpen, isFullscreen]);

  useEffect(() => {
    if (isOpen || isFullscreen) setUnread(0);
  }, [isOpen, isFullscreen]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = (isOpen || isFullscreen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isFullscreen]);

  // Speech cancel on close
  useEffect(() => {
    if (!isOpen && !isFullscreen) stopSpeech();
  }, [isOpen, isFullscreen, stopSpeech]);

  const clearTelemetry = useCallback(() => setTelemetryLogs([]), [setTelemetryLogs]);

  const handleExport = useCallback(() => {
    if (messages.length <= 1) return;
    const content = messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Portfolio AI';
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour12: true });
      return `[${time}] ${role}:\n${m.content}\n\n${'─'.repeat(40)}\n`;
    }).join('\n');
    const blob = new Blob(
      [`Goutham's Portfolio AI Chat Export\nGenerated: ${new Date().toLocaleDateString()}\n\n${content}`],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `portfolio_chat_${Date.now()}.txt`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }, [messages]);

  // Bug #5 Fix: The previous expression was `aiStatus !== 'offline' || true`
  // which is a tautology — always evaluates to true regardless of status.
  // Now the FAB is always shown (the offline state is communicated inside
  // the widget header, not by hiding the button).
  const statusResolved = true;

  return (
    <>
      {/* Global keyframe styles injected once */}
      <style>{`
        @keyframes aurora1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.1); }
          66% { transform: translate(-20px,10px) scale(0.95); }
        }
        @keyframes btnGlow {
          0%, 100% { box-shadow: 0 4px 8px rgba(34,211,238,.06), 0 0 0 1px rgba(34,211,238,.04); }
          50% { box-shadow: 0 4px 14px rgba(34,211,238,.14), 0 0 0 1px rgba(34,211,238,.08); }
        }
        .widget-scroll::-webkit-scrollbar,
        .fullscreen-scroll::-webkit-scrollbar,
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .widget-scroll::-webkit-scrollbar-track,
        .fullscreen-scroll::-webkit-scrollbar-track,
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .widget-scroll::-webkit-scrollbar-thumb,
        .fullscreen-scroll::-webkit-scrollbar-thumb,
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.15); border-radius: 8px; }
        .widget-scroll::-webkit-scrollbar-thumb:hover,
        .fullscreen-scroll::-webkit-scrollbar-thumb:hover,
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.25); }
      `}</style>

      {/* Fullscreen view */}
      <AnimatePresence mode="wait">
        {isFullscreen && (
          <div className="fixed inset-0 z-[120] bg-[#030508]">
            <ChatLayout
              sessions={sessions}
              activeSessionId={activeSessionId}
              messages={messages}
              isTyping={isTyping}
              handleSend={handleSend}
              handleClear={handleClear}
              handleNewChat={handleNewChat}
              handleSelectSession={handleSelectSession}
              handleDeleteSession={handleDeleteSession}
              handlePinSession={handlePinSession}
              handleExport={handleExport}
              aiStatus={aiStatus}
              speakingMsgId={speakingMsgId}
              handleToggleSpeech={(msgId, text) => handleToggleSpeech(msgId, text, speechRate)}
              onMinimize={() => { setIsFullscreen(false); setIsOpen(true); }}
              onClose={() => { setIsFullscreen(false); setIsOpen(false); }}
              telemetryLogs={telemetryLogs}
              clearTelemetry={clearTelemetry}
              speechRate={speechRate}
              setSpeechRate={setSpeechRate}
              baseUrl={baseUrl}
              setBaseUrl={setBaseUrl}
              activeArtifact={activeArtifact}
              setActiveArtifact={setActiveArtifact}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Floating Compact Widget */}
      <AnimatePresence mode="wait">
        {isOpen && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-[110] flex flex-col md:inset-auto md:fixed md:bottom-[5.5rem] md:right-6 md:w-[440px] md:h-[680px] md:max-h-[calc(100vh-7rem)] md:rounded-[28px] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(7,18,37,0.98) 0%, rgba(3,5,8,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
              backdropFilter: 'blur(32px)',
            }}
          >
            {/* Aurora decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              <div
                className="absolute rounded-full"
                style={{
                  top: '-10%', right: '-15%',
                  width: '250px', height: '250px',
                  background: 'radial-gradient(ellipse at center, #22d3ee 0%, transparent 70%)',
                  filter: 'blur(50px)',
                  opacity: 0.08,
                  animation: 'aurora1 12s ease-in-out infinite',
                }}
              />
            </div>

            {/* Widget Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/[0.04] bg-white/[0.01] flex-shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <Bot size={20} className="text-cyan-400" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#071225] transition-all ${
                    aiStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : aiStatus === 'offline' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-white tracking-tight">Portfolio AI</span>
                    <Sparkles size={11} className="text-cyan-400 opacity-60" />
                  </div>
                  <div className="flex items-center gap-2 -mt-0.5">
                    <span className={`text-[9px] uppercase tracking-wider font-bold block ${
                      aiStatus === 'online' ? 'text-emerald-400' : aiStatus === 'offline' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {aiStatus === 'online' ? 'Online' : aiStatus === 'offline' ? 'Offline' : 'Connecting…'}
                    </span>
                    <button
                      onClick={recheckStatus}
                      className="text-[9px] text-slate-400 hover:text-cyan-400 underline transition-colors cursor-pointer"
                      title="Recheck status"
                    >
                      Recheck
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
                  title="New chat"
                  aria-label="Start new chat session"
                >
                  <Plus size={15} />
                </button>
                <button
                  onClick={() => { setIsOpen(false); setIsFullscreen(true); }}
                  className="hidden lg:flex h-8 w-8 rounded-xl items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
                  title="Fullscreen"
                  aria-label="Expand chat window to fullscreen"
                >
                  <Maximize2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Close chat window"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Offline Warning Banner */}
            {aiStatus === 'offline' && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-rose-400 text-[11px] font-medium">
                    AI assistant is currently offline.
                  </span>
                </div>
                <button
                  onClick={recheckStatus}
                  className="px-2.5 py-1 text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 rounded-lg transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Widget Messages or Empty State */}
            {messages.length <= 1 ? (
              <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col">
                <div className="my-auto w-full">
                  <EmptyState onSend={handleSend} fullscreen={false} disabled={aiStatus === 'offline'} />
                </div>
              </div>
            ) : (
              <ChatMessages
                messages={messages}
                fullscreen={false}
                isTyping={isTyping}
                speakingMsgId={speakingMsgId}
                onToggleSpeech={(msgId, text) => handleToggleSpeech(msgId, text, speechRate)}
                scrollRef={widgetScrollRef}
                onSelectArtifact={setActiveArtifact}
                activeArtifact={activeArtifact}
              />
            )}

            {/* Widget Input */}
            <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-white/[0.04] bg-[#020407]/40 backdrop-blur-xl">
              <ChatInput
                onSend={handleSend}
                isTyping={isTyping}
                fullscreen={false}
                disabled={aiStatus === 'offline'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — only shown after status is resolved */}
      <AnimatePresence>
        {!isFullscreen && statusResolved && (
          <motion.button
            key="fab"
            id="chatbot-toggle"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setIsOpen(o => !o)}
            title={isOpen ? 'Close AI assistant' : `Portfolio AI Assistant (${aiStatus === 'online' ? 'Online' : aiStatus === 'offline' ? 'Offline' : 'Connecting…'})`}
            aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
            className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center cursor-pointer border-none outline-none z-10"
            style={{
              background: isOpen
                ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                : aiStatus === 'offline'
                  ? 'linear-gradient(135deg, #374151, #1f2937)'
                  : 'rgba(7, 18, 37, 0.85)',
              border: isOpen
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(34,211,238,0.2)',
              boxShadow: isOpen
                ? '0 6px 16px rgba(0,0,0,0.35)'
                : '0 4px 15px rgba(34,211,238,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              animation: !isOpen && aiStatus === 'online' ? 'btnGlow 4s ease-in-out infinite' : 'none',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Realtime Status Indicator Badge on FAB */}
            {!isOpen && (
              <span
                className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#030508] transition-all duration-300 z-20 ${
                  aiStatus === 'online'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse'
                    : aiStatus === 'offline'
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                      : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                }`}
                title={`Status: ${aiStatus.toUpperCase()}`}
              />
            )}

            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="x"
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <X size={22} className="text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="bot"
                  initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Bot size={24} className={aiStatus === 'offline' ? 'text-slate-400' : 'text-cyan-400'} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unread badge */}
            <AnimatePresence>
              {!isOpen && unread > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 10 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -bottom-1 -left-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#030508] shadow-lg z-20"
                >
                  {unread}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
