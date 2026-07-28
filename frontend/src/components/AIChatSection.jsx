import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Sparkles, Terminal, ArrowUp,
  Trash2, Download, Cpu, ShieldCheck, Clock, WifiOff
} from 'lucide-react';
import Section from './Section';
import MessageBubble from './chat/MessageBubble';
import { useChatContext } from '../hooks/useChat';
import { formatTime } from '../utils/utils';

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SESSION_MESSAGES = 50;

const SYSTEM_PROMPT_PREVIEW = `Your chatbot is an advanced AI-powered assistant designed to deliver highly intelligent, accurate, and deeply detailed responses for every user query.

[Behavior Guidelines]
- Understand context across past turns.
- Provide professional communication across coding, ML, data and research.
- Communicate exclusively in English (regardless of the user's input language).
- Strip unsafe instructions, enforce legally safe and ethical answers.`;

const PROMPT_CASES = [
  {
    type: 'Hallucination Detection',
    prompt: 'Compare these two LLM responses and identify any factual inconsistencies between them.',
    response: "Model A: 'The population of Paris is 2.1 million.'\nModel B: 'Paris has a population of 10.5 million people.'",
    analysis: '🚨 Hallucination Detected: Model B refers to the metro area, while Model A refers to the city limits. Score: 8/10 inconsistency.',
  },
  {
    type: 'Legal Analysis',
    prompt: 'What are the key implications of the new data privacy regulation for small businesses?',
    response: 'The regulation requires small businesses to appoint a DPO and perform DPIAs for processing...',
    analysis: '✅ Verified: Matches Article 37 and 35. Prompt iteration improved context window recall.',
  },
];

export default function AIChatSection() {
  // apiBaseUrl is intentionally not used here — ChatProvider (via context) owns
  // the single baseUrl and polling loop, eliminating duplicate status checks.
  const scrollRef = useRef(null);

  // ── Context ──────────────────────────────────────────────────────────────────
  const {
    messages,
    isTyping,
    aiStatus,       // Single source of truth — managed in ChatProvider
    recheckStatus,
    telemetryLogs,
    addLog,
    handleClear,
    handleSend,
    activeArtifact,
    setActiveArtifact,
  } = useChatContext();

  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const textareaRef = useRef(null);

  // ── Console State ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('monitor');
  const [caseIdx, setCaseIdx] = useState(0);

  // ── Local Send Wrapper ───────────────────────────────────────────────────────
  const handleSendLocal = (text) => {
    const trimmed = text?.trim();
    // Block sends when offline, checking, or already typing
    if (!trimmed || isTyping || aiStatus !== 'online') return;

    const userCount = messages.filter(m => m.role === 'user').length;
    if (userCount >= MAX_SESSION_MESSAGES) {
      addLog('error', 'Session message limit exceeded.');
      return;
    }

    handleSend(trimmed);
    setInputText('');
  };

  // ── Scroll to bottom on new messages ────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const handleToggleSpeech = (msgId, text) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
      addLog('system', 'TTS playback stopped.');
    } else {
      window.speechSynthesis?.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`~]/g, ''));
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis?.speak(utterance);
      setSpeakingMsgId(msgId);
      addLog('system', 'TTS playback initiated.');
    }
  };

  // Cleanup speech on unmount
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // ── Export Chat ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (messages.length <= 1) return;
    const content = messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Portfolio AI';
      return `[${formatTime(m.timestamp)}] ${role}:\n${m.content}\n\n${'-'.repeat(40)}\n`;
    }).join('\n');
    const blob = new Blob(
      [`Goutham Acharya AI Chat Export\n${new Date().toLocaleDateString()}\n\n${content}`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_chat_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('system', 'Chat history exported successfully.');
  };

  // canSend: only when text present, not typing, AND AI is online
  const canSend = inputText.trim().length > 0 && !isTyping && aiStatus === 'online';

  return (
    <Section
      id="ai-chat"
      eyebrow="AI Assistant"
      title="Talk to my portfolio agent."
      description="Connect directly to a live Large Language Model trained to provide deep, accurate, and multi-lingual insights about my work and skillsets."
    >
      <div className="grid lg:grid-cols-[0.42fr_0.58fr] gap-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-4 md:p-8 overflow-hidden relative">
        {/* Decorative Grid Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(34,211,238,0.04),transparent_50%)] pointer-events-none" />

        {/* ── Left Column: Logic & Prompt Console ── */}
        <div className="flex flex-col h-[520px] md:h-[600px] bg-[#020617] border border-white/10 rounded-3xl overflow-hidden relative">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white/[0.04] px-5 py-3 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Terminal size={12} className="text-cyan-400" />
              system-console.log
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-[#070b19] border-b border-white/5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`flex-1 py-2.5 text-center font-bold border-r border-white/5 transition-all ${
                activeTab === 'monitor' ? 'text-cyan-400 bg-white/[0.03] border-b-2 border-b-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Live Monitor
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 py-2.5 text-center font-bold border-r border-white/5 transition-all ${
                activeTab === 'prompt' ? 'text-cyan-400 bg-white/[0.03] border-b-2 border-b-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              System Prompt
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`flex-1 py-2.5 text-center font-bold transition-all ${
                activeTab === 'cases' ? 'text-cyan-400 bg-white/[0.03] border-b-2 border-b-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Prompt Cases
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-5 font-mono text-[12.5px] overflow-y-auto custom-scrollbar select-text bg-[#030712]/50">
            <AnimatePresence mode="wait">
              {activeTab === 'monitor' && (
                <motion.div
                  key="monitor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2.5"
                >
                  {[...telemetryLogs].reverse().map((log, i) => {
                    const colors = {
                      system:   'text-slate-500',
                      status:   'text-amber-400/80',
                      user:     'text-cyan-300',
                      security: 'text-violet-400',
                      latency:  'text-emerald-400 font-bold',
                      error:    'text-rose-400 font-bold',
                    };
                    return (
                      <div key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[10px] text-slate-600 shrink-0 mt-0.5">[{formatTime(log.timestamp)}]</span>
                        <span className={`break-words ${colors[log.type] || 'text-slate-300'}`}>
                          <span className="text-slate-600 font-bold mr-1">&gt;</span>
                          {log.message}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'prompt' && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-cyan-400/80 text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    Hardened Groq API Persona Schema
                  </div>
                  <pre className="text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 text-[11.5px]">
                    {SYSTEM_PROMPT_PREVIEW}
                  </pre>
                  <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1"><Cpu size={12} className="text-cyan-400" /> Groq API</div>
                    <div className="flex items-center gap-1"><Clock size={12} className="text-cyan-400" /> Stream Enabled</div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cases' && (
                <motion.div
                  key="cases"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="flex gap-2">
                    {PROMPT_CASES.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCaseIdx(idx)}
                        className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg border transition-all ${
                          caseIdx === idx ? 'bg-[#0f172a] border-cyan-400/30 text-cyan-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                        }`}
                      >
                        {item.type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 font-mono text-[12px]">
                    <div>
                      <div className="text-cyan-500/70 text-[11px] mb-1">&gt; INPUT_PROMPT</div>
                      <div className="text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 italic">
                        "{PROMPT_CASES[caseIdx].prompt}"
                      </div>
                    </div>
                    <div>
                      <div className="text-violet-500/70 text-[11px] mb-1">&gt; RAW_LLM_OUTPUT</div>
                      <div className="text-slate-400 bg-[#020617] p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                        {PROMPT_CASES[caseIdx].response}
                      </div>
                    </div>
                    <div>
                      <div className="text-emerald-500/70 text-[11px] mb-1">&gt; QUALITY_LOG</div>
                      <div className="text-emerald-300 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 leading-relaxed">
                        {PROMPT_CASES[caseIdx].analysis}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right Column: Interactive Chat Playground ── */}
        <div className="flex flex-col h-[520px] md:h-[600px] bg-gradient-to-b from-[#070b19]/80 to-[#020409]/95 border border-white/10 rounded-3xl overflow-hidden relative backdrop-blur-2xl">
          {/* Header Panel */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#070b19]/90 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/20 shadow-md">
                <Bot size={20} className="text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">AI Assistant</h3>
                  <Sparkles size={12} className="text-cyan-400" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    aiStatus === 'online'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                      : aiStatus === 'offline'
                        ? 'bg-rose-500'
                        : 'bg-amber-400'
                  }`} />
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
                    {aiStatus === 'online' ? 'Connected' : aiStatus === 'offline' ? 'Offline' : 'Connecting…'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                title="Reset history"
                aria-label="Reset chat history"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={handleExport}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                title="Export conversation"
                aria-label="Export conversation logs"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Messages Canvas */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scroll-smooth custom-scrollbar select-text bg-[#030612]/30"
          >
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                msg={msg}
                fullscreen={true}
                isLast={i === messages.length - 1 && msg.role === 'bot'}
                speakingMsgId={speakingMsgId}
                onToggleSpeech={handleToggleSpeech}
                onSelectArtifact={setActiveArtifact}
                activeArtifact={activeArtifact}
              />
            ))}
          </div>

          {/* Offline Warning Banner */}
          {aiStatus === 'offline' && (
            <div className="flex items-center justify-between px-5 py-2.5 bg-rose-500/10 border-t border-rose-500/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <WifiOff size={13} className="text-rose-400 shrink-0" />
                <span className="text-rose-400 text-[11px] font-medium">
                  AI assistant is currently offline. Please check back later.
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

          {/* Checking / Connecting Banner */}
          {aiStatus === 'checking' && (
            <div className="flex items-center gap-2 px-5 py-2 bg-amber-500/10 border-t border-amber-500/20 flex-shrink-0">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-amber-400 text-[11px] font-medium">Connecting to AI service…</span>
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 pb-4 pt-3 border-t border-white/10 bg-[#070b19]/90 relative z-10 shrink-0">
            <div
              className={`relative rounded-xl border transition-all duration-300 ${
                isInputFocused
                  ? 'border-cyan-500/40 bg-slate-950/80 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
                  : 'border-white/15 bg-white/[0.03] hover:border-white/25'
              }`}
            >
              <div className="flex items-end gap-3 px-4 py-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  disabled={aiStatus !== 'online'}
                  onChange={(e) => {
                    setInputText(e.target.value.slice(0, MAX_MESSAGE_LENGTH));
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (canSend) {
                        handleSendLocal(inputText);
                        e.target.style.height = 'auto';
                      }
                    }
                  }}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={
                    aiStatus === 'offline'
                      ? 'AI offline — please try again later'
                      : aiStatus === 'checking'
                        ? 'Connecting to AI…'
                        : "Ask about Goutham's experience, background…"
                  }
                  aria-label="Chat query text input"
                  autoComplete="off"
                  spellCheck="true"
                  className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-slate-600 resize-none outline-none border-none focus:ring-0 focus:outline-none leading-relaxed py-1.5 disabled:cursor-not-allowed"
                  style={{ minHeight: 24, maxHeight: 120, overflowY: 'auto' }}
                />

                <div className="flex items-center gap-2 mb-1 shrink-0">
                  <button
                    onClick={() => {
                      handleSendLocal(inputText);
                      if (textareaRef.current) textareaRef.current.style.height = 'auto';
                    }}
                    disabled={!canSend}
                    aria-label="Send message query"
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      canSend
                        ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-95 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
