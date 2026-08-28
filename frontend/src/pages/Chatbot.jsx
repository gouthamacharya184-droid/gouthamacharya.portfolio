import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Plus, Maximize2 } from 'lucide-react';
import { useChatContext } from '../hooks/useChat';
import { useSpeech } from '../hooks/useSpeech';
import { checkChatStatus, checkBackendHealth } from '../utils/chatApi';
import { getApiBaseUrl } from '../utils/api';

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
  const defaultBaseUrl = getApiBaseUrl(apiBaseUrl);
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
    telemetryLogs,
    setTelemetryLogs,
    activeArtifact,
    setActiveArtifact,
    addLog,
  } = useChatContext();

  const { speakingMsgId, handleToggleSpeech, stopSpeech } = useSpeech();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const [unread, setUnread] = useState(0);

  // Widget scroll
  const widgetScrollRef = useRef(null);
  const scrollToWidgetBottom = useCallback(() => {
    widgetScrollRef.current?.scrollTo({ top: widgetScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen && !isFullscreen) scrollToWidgetBottom();
  }, [messages, isTyping, isOpen, isFullscreen, scrollToWidgetBottom]);

  // ── Status check — 2-phase: /health first (90s cold-start), then /chat/status ──
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const status = await checkChatStatus(baseUrl);
      if (!cancelled) setAiStatus(status);
    };

    check();
    const interval = setInterval(check, 60_000);

    // Keep-alive every 14 min to prevent Render free-tier sleep
    const keepAlive = setInterval(async () => {
      if (!cancelled) await checkBackendHealth(baseUrl);
    }, 14 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearInterval(keepAlive);
    };
  }, [baseUrl]);

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

  // Auto-close chat only if truly offline (server unreachable)
  // Keep open during waking/degraded so user sees the status banner
  useEffect(() => {
    if (aiStatus === 'offline') {
      setIsOpen(false);
      setIsFullscreen(false);
    }
  }, [aiStatus]);

  // FAB visible when status is resolved (not checking/offline)
  const statusResolved = aiStatus === 'online' || aiStatus === 'waking' || aiStatus === 'degraded';

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
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#071225] ${
                    aiStatus === 'online'   ? 'bg-emerald-400 animate-pulse' :
                    aiStatus === 'waking'   ? 'bg-amber-400 animate-pulse' :
                    aiStatus === 'degraded' ? 'bg-orange-400 animate-pulse' :
                    aiStatus === 'offline'  ? 'bg-red-400' :
                    'bg-amber-400 animate-pulse'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-white tracking-tight">Portfolio AI</span>
                    <Sparkles size={11} className="text-cyan-400 opacity-60" />
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-bold block -mt-0.5 ${
                    aiStatus === 'online'   ? 'text-emerald-400' :
                    aiStatus === 'waking'   ? 'text-amber-400' :
                    aiStatus === 'degraded' ? 'text-orange-400' :
                    aiStatus === 'offline'  ? 'text-red-400' :
                    'text-amber-400'
                  }`}>
                    {aiStatus === 'online'   ? 'Online' :
                     aiStatus === 'waking'   ? 'Waking Up…' :
                     aiStatus === 'degraded' ? 'AI Degraded' :
                     aiStatus === 'offline'  ? 'Offline' :
                     'Connecting…'}
                  </span>
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

            {/* Status Banners */}
            {aiStatus === 'waking' && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex-shrink-0">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-amber-400 text-[11px] font-medium">
                  Waking up the server… first response may take ~30s.
                </span>
              </div>
            )}
            {aiStatus === 'degraded' && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 border-b border-orange-500/20 flex-shrink-0">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
                <span className="text-orange-400 text-[11px] font-medium">
                  Backend is running but AI service needs attention.
                </span>
              </div>
            )}

            {/* Widget Messages or Empty State */}
            {messages.length <= 1 ? (
              <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col">
                <div className="my-auto w-full">
                  <EmptyState onSend={handleSend} fullscreen={false} />
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
                disabled={aiStatus === 'offline' || aiStatus === 'checking'}
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
                  <Bot size={24} className={aiStatus === 'offline' ? 'text-slate-500' : 'text-cyan-400'} />
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
                  className="absolute -top-2 -right-2 h-6 min-w-[1.5rem] px-1.5 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#030508] shadow-lg"
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
