import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sliders, Terminal, Play, Code, X, ChevronRight, CornerDownLeft, Sparkles 
} from 'lucide-react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import EmptyState from '../components/chat/EmptyState';
import ScrollToBottom from '../components/chat/ScrollToBottom';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

export default function ChatLayout({
  sessions,
  activeSessionId,
  messages,
  isTyping,
  handleSend,
  handleClear,
  handleNewChat,
  handleSelectSession,
  handleDeleteSession,
  handlePinSession,
  handleExport,
  aiStatus,
  speakingMsgId,
  handleToggleSpeech,
  onMinimize,
  onClose,
  telemetryLogs = [],
  clearTelemetry = null,
  speechRate = 1.0,
  setSpeechRate = null,
  baseUrl = '',
  setBaseUrl = null,
  activeArtifact = null,
  setActiveArtifact = null
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);

  const scrollRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [artifactTab, setArtifactTab] = useState('preview');
  const [artifactWidth, setArtifactWidth] = useState(550);
  const isDraggingRef = useRef(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isFarUp = scrollHeight - scrollTop - clientHeight > 200;
    setShowScrollBtn(isFarUp);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(open => !open);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startDrag = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleDrag = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 320 && newWidth < window.innerWidth * 0.7) {
      setArtifactWidth(newWidth);
    }
  }, []);

  const stopDrag = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  }, [handleDrag]);

  // Ensure drag listeners are always cleaned up on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
  }, [handleDrag, stopDrag]);

  const commands = [
    { name: 'New Chat', desc: 'Create a new conversation session', icon: '➕', action: () => { handleNewChat(); setCommandPaletteOpen(false); } },
    { name: 'Clear History', desc: 'Reset messages in current session', icon: '🧹', action: () => { handleClear(); setCommandPaletteOpen(false); } },
    { name: 'Export History', desc: 'Save current chat to text document', icon: '💾', action: () => { handleExport(); setCommandPaletteOpen(false); } },
    { name: 'Open Settings', desc: 'Configure voice and telemetry settings', icon: '⚙️', action: () => { setSettingsOpen(true); setCommandPaletteOpen(false); } },
    { name: 'Toggle Telemetry console', desc: 'Show developer debug streams', icon: '📟', action: () => { setTelemetryOpen(o => !o); setCommandPaletteOpen(false); } },
  ];

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(commandSearch.toLowerCase()) || 
    c.desc.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const handleCommandKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCommandIndex(idx => (idx + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCommandIndex(idx => (idx - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[commandIndex]) {
        filteredCommands[commandIndex].action();
      }
    }
  };

  return (
    <div className="flex w-full h-full text-slate-100 overflow-hidden relative font-sans">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        sidebarOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onPinSession={handlePinSession}
        onToggleSidebar={() => setSidebarOpen(false)}
        onExport={handleExport}
        onSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#05070c]">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          aiStatus={aiStatus}
          speakingMsgId={speakingMsgId}
          onNewChat={handleNewChat}
          onClear={handleClear}
          onExport={handleExport}
          onMinimize={onMinimize}
          onClose={onClose}
          onSettings={() => setSettingsOpen(true)}
        />

        {messages.length <= 1 ? (
          <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
            <EmptyState onSend={handleSend} fullscreen={true} disabled={aiStatus === 'offline'} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
            <ChatMessages
              messages={messages}
              fullscreen={true}
              isTyping={isTyping}
              speakingMsgId={speakingMsgId}
              onToggleSpeech={handleToggleSpeech}
              scrollRef={scrollRef}
              onScroll={handleScroll}
              onSelectArtifact={setActiveArtifact}
              activeArtifact={activeArtifact}
            />

            <ScrollToBottom onClick={scrollToBottom} visible={showScrollBtn} />
          </div>
        )}

        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-white/[0.04] bg-[#03050a]/40 backdrop-blur-xl">
          <ChatInput
            onSend={handleSend}
            isTyping={isTyping}
            fullscreen={true}
            disabled={aiStatus === 'offline'}
          />
        </div>

        <AnimatePresence>
          {telemetryOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 180 }}
              exit={{ height: 0 }}
              className="border-t border-white/10 bg-[#020408] flex flex-col font-mono text-[11px] text-emerald-400 overflow-hidden shrink-0 z-30"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02] text-slate-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-300">
                  <Terminal size={11} /> Developer Telemetry Monitor
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={clearTelemetry} className="hover:text-white transition-all text-[10px]">
                    Clear logs
                  </button>
                  <button onClick={() => setTelemetryOpen(false)} className="hover:text-white">
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar select-text selection:bg-emerald-500/20">
                {telemetryLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[10px] text-slate-500 shrink-0 select-none">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[8.5px] uppercase tracking-wider shrink-0 select-none ${
                      log.type === 'error' ? 'bg-red-950 text-red-400 border border-red-800/40' :
                      log.type === 'security' ? 'bg-purple-950 text-purple-400 border border-purple-800/40' :
                      log.type === 'latency' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' :
                      log.type === 'user' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' :
                      'bg-slate-950 text-slate-400 border border-white/5'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 leading-normal">{log.message}</span>
                  </div>
                ))}
                {telemetryLogs.length === 0 && (
                  <span className="text-slate-600 italic select-none">Console quiet. Awaiting user prompts or server sockets...</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeArtifact && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setActiveArtifact(null)}
            />

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: artifactWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative shrink-0 flex flex-col h-full bg-[#060911] border-l border-white/10 z-40 select-none"
              style={{ width: artifactWidth }}
            >
              <div
                onMouseDown={startDrag}
                className="absolute top-0 bottom-0 left-0 w-1 cursor-col-resize hover:bg-cyan-400/40 transition-colors z-50 group"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-white/5 group-hover:bg-cyan-400/20 border border-white/10 rounded flex items-center justify-center pointer-events-none transition-all">
                  <div className="w-[1.5px] h-4 bg-slate-500 group-hover:bg-cyan-400 rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-cyan-950 flex items-center justify-center border border-cyan-800/40">
                    <Sparkles size={12} className="text-cyan-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[240px]">
                    {activeArtifact.title || 'Code Sandbox'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveArtifact(null)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.04] bg-white/[0.005] flex-shrink-0">
                <button
                  onClick={() => setArtifactTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    artifactTab === 'preview' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Play size={12} /> Live Preview
                </button>
                <button
                  onClick={() => setArtifactTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    artifactTab === 'code' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Code size={12} /> Raw Code
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5 select-text bg-[#030508]">
                {artifactTab === 'preview' ? (
                  <div className="w-full h-full rounded-2xl border border-white/5 bg-[#090d16] overflow-hidden flex flex-col relative">
                    <iframe
                      title="Live sandbox frame"
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts"
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="UTF-8">
                            <style>
                              body {
                                margin: 0;
                                padding: 24px;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                background-color: #0d1117;
                                color: #c9d1d9;
                              }
                              ${activeArtifact.type === 'css' ? activeArtifact.code : ''}
                            </style>
                          </head>
                          <body>
                            ${activeArtifact.type === 'svg' || activeArtifact.type === 'html' ? activeArtifact.code : ''}
                            ${
                              activeArtifact.type === 'javascript' || activeArtifact.type === 'js'
                                ? `<div id="app"></div><script>${activeArtifact.code}</script>`
                                : ''
                            }
                          </body>
                        </html>
                      `}
                    />
                  </div>
                ) : (
                  <div className="w-full font-mono text-xs overflow-x-auto select-all leading-normal bg-[#04060b] p-4 rounded-2xl border border-white/5">
                    <pre className="text-cyan-300/90 whitespace-pre">{activeArtifact.code}</pre>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

        <AnimatePresence>
          {commandPaletteOpen && (
            <div className="fixed inset-0 z-[250] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-md">
              <div className="fixed inset-0" onClick={() => setCommandPaletteOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                className="w-full max-w-xl bg-[#090f19] border border-white/15 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden z-10"
              >
                <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/10">
                  <Search size={18} className="text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={commandSearch}
                    onChange={(e) => {
                      setCommandSearch(e.target.value);
                      setCommandIndex(0);
                    }}
                    onKeyDown={handleCommandKey}
                    placeholder="Type a command or model name…"
                    className="flex-1 bg-transparent text-[14px] text-white placeholder:text-slate-500 focus:outline-none"
                    autoFocus
                  />
                  <span className="text-[10px] text-slate-500 bg-white/5 border border-white/10 px-2 py-1 rounded-md font-mono">
                    ESC
                  </span>
                </div>

                <div className="max-h-[330px] overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                  {filteredCommands.map((cmd, idx) => (
                    <div
                      key={cmd.name}
                      onClick={cmd.action}
                      onMouseEnter={() => setCommandIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all ${
                        idx === commandIndex ? 'bg-white/[0.08]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="text-lg shrink-0 select-none">{cmd.icon}</span>
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block ${idx === commandIndex ? 'text-white' : 'text-slate-300'}`}>
                            {cmd.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">{cmd.desc}</span>
                        </div>
                      </div>
                      {idx === commandIndex && (
                        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/30 px-2 py-1 rounded flex items-center gap-1 font-bold">
                          ENTER <CornerDownLeft size={10} />
                        </span>
                      )}
                    </div>
                  ))}
                  {filteredCommands.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No matching commands found.
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="System Configurations">
          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Backend Endpoint Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="e.g. http://localhost:5000"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Speech Synthesis Rate
                </label>
                <span className="text-[11px] font-mono font-bold text-cyan-400">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(false)}>
                Close Configurations
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
}
