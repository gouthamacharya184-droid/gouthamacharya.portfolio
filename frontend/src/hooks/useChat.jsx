import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { sendChatMessage, checkChatStatus } from '../utils/chatApi';
import { makeId, truncate } from '../utils/utils';

const ChatContext = createContext(null);

const WELCOME_GREETING =
  "Hi! I'm Goutham's AI assistant 👋\n\nI can answer anything about his work, skills, projects, or background!";

function makeSession(title = 'New Chat') {
  return {
    id: makeId(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [{ role: 'bot', content: WELCOME_GREETING, timestamp: Date.now(), id: makeId() }],
    pinned: false,
  };
}

function deriveSessionTitle(messages) {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'New Chat';
  return truncate(first.content.trim(), 40);
}

const INITIAL_SESSION = makeSession('New Chat');

export function ChatProvider({ children, apiBaseUrl }) {
  // In production, apiBaseUrl = VITE_API_BASE_URL (Render URL).
  // In development, apiBaseUrl = "" and Vite proxy handles /api/* routes.
  // NEVER fall back to window.location.origin — that would send API calls
  // to the frontend (Vercel) domain instead of the backend (Render) domain.
  const baseUrl = (apiBaseUrl ?? "").replace(/\/$/, "");

  const [sessions, setSessions] = useState([INITIAL_SESSION]);
  const [activeSessionId, setActiveSessionId] = useState(INITIAL_SESSION.id);
  const [isTyping, setIsTyping] = useState(false);
  const isSendingRef = useRef(false);
  const activeAbortControllerRef = useRef(null);

  // ── Centralised AI status — single source of truth ───────────────────────
  const [aiStatus, setAiStatus] = useState('checking');

  const recheckStatus = useCallback(async () => {
    setAiStatus('checking');
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setAiStatus('offline');
      return 'offline';
    }
    const status = await checkChatStatus(baseUrl);
    setAiStatus(status);
    return status;
  }, [baseUrl]);

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    const runCheck = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (!cancelled) {
          setAiStatus('offline');
          scheduleNext('offline');
        }
        return;
      }
      const status = await checkChatStatus(baseUrl);
      if (!cancelled) {
        setAiStatus(status);
        scheduleNext(status);
      }
    };

    const scheduleNext = (currentStatus) => {
      if (cancelled) return;
      // Retry more aggressively (every 20s) when offline so we recover quickly
      const delay = currentStatus === 'offline' ? 20_000 : 60_000;
      intervalId = setTimeout(runCheck, delay);
    };

    runCheck();

    // ── Instant detection via browser Online/Offline events ─────────────────────
    const handleGoOffline = () => {
      if (!cancelled) {
        clearTimeout(intervalId);
        setAiStatus('offline');
        scheduleNext('offline');
      }
    };
    const handleGoOnline = () => {
      if (!cancelled) {
        clearTimeout(intervalId);
        setAiStatus('checking');
        runCheck();
      }
    };

    window.addEventListener('offline', handleGoOffline);
    window.addEventListener('online', handleGoOnline);

    return () => {
      cancelled = true;
      clearTimeout(intervalId);
      window.removeEventListener('offline', handleGoOffline);
      window.removeEventListener('online', handleGoOnline);
    };
  }, [baseUrl]);

  const [telemetryLogs, setTelemetryLogs] = useState([
    { type: 'status', message: 'Groq LLM status check queued.', timestamp: Date.now() - 50 },
    { type: 'system', message: 'Console initialized. System ready.', timestamp: Date.now() - 100 },
  ]);
  const [activeArtifact, setActiveArtifact] = useState(null);

  const addLog = useCallback((type, message) => {
    setTelemetryLogs(prev => [
      { type, message, timestamp: Date.now() },
      ...prev,
    ].slice(0, 100));
  }, []);

  // Keep aiStatus changes visible in telemetry
  const prevAiStatusRef = useRef(null);
  useEffect(() => {
    if (aiStatus !== prevAiStatusRef.current) {
      prevAiStatusRef.current = aiStatus;
      addLog('status', `Groq LLM endpoint checked. Status: ${aiStatus.toUpperCase()}`);
    }
  }, [aiStatus, addLog]);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) ?? sessions[0] ?? null;
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages ?? [];

  const updateActiveMessages = useCallback((updater) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== activeSessionId) return s;
      const newMsgs = typeof updater === 'function' ? updater(s.messages) : updater;
      const firstUser = newMsgs.find(m => m.role === 'user');
      return {
        ...s,
        messages: newMsgs,
        updatedAt: Date.now(),
        title: firstUser ? deriveSessionTitle(newMsgs) : s.title,
      };
    }));
  }, [activeSessionId]);

  const handleNewChat = useCallback(() => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const s = makeSession('New Chat');
    setSessions(prev => [s, ...prev]);
    setActiveSessionId(s.id);
    setIsTyping(false);
    isSendingRef.current = false;
  }, []);

  const handleSelectSession = useCallback((id) => {
    setActiveSessionId(id);
    window.speechSynthesis?.cancel();
  }, []);

  const handleDeleteSession = useCallback((id) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        const s = makeSession('New Chat');
        setActiveSessionId(s.id);
        return [s];
      }
      if (id === activeSessionId) setActiveSessionId(next[0].id);
      return next;
    });
  }, [activeSessionId]);

  const handlePinSession = useCallback((id) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
  }, []);

  const handleClear = useCallback(() => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    setIsTyping(false);
    isSendingRef.current = false;
    updateActiveMessages([{
      role: 'bot',
      content: WELCOME_GREETING,
      timestamp: Date.now(),
      id: makeId(),
    }]);
  }, [updateActiveMessages]);

  const extractArtifact = useCallback((text) => {
    if (!text) return null;
    const match = text.match(/```(html|css|javascript|js|svg|json)\n([\s\S]*?)```/);
    if (match) {
      return {
        type: match[1] === 'js' ? 'javascript' : match[1],
        code: match[2],
        title: match[1].toUpperCase() + ' Artifact',
      };
    }
    return null;
  }, []);

  // ── Bug #6 Fix: sessions ref ─────────────────────────────────────────────────
  // `sessions` was in handleSend's dependency array. Since sessions updates on
  // every streaming chunk, handleSend was recreated ~50–100× per response,
  // triggering unnecessary re-renders in every child that received it as a prop.
  // We use a ref to read the latest sessions value without it being a dep.
  const sessionsRef = useRef(sessions);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  const handleSend = useCallback(async (text) => {
    const trimmed = text?.trim();
    // Use the ref for the sending guard — avoids stale state from useCallback closure
    if (!trimmed || isSendingRef.current) return;

    const targetSessionId = activeSessionId;
    // Bug #6: Read via ref — always up-to-date but not a reactive dependency
    const targetSession = sessionsRef.current.find(s => s.id === targetSessionId);
    const existingMsgs = targetSession?.messages ?? [];

    // Extract recent conversation history to send to backend
    const history = existingMsgs
      .filter(m => (m.role === 'user' || (m.role === 'bot' && m.content && m.content !== WELCOME_GREETING)))
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))
      .slice(-10);

    const userMsg = { role: 'user', content: trimmed, timestamp: Date.now(), id: makeId() };
    const botPlaceholder = { role: 'bot', content: '', timestamp: Date.now(), id: makeId() };

    isSendingRef.current = true;
    setIsTyping(true);

    // Abort any prior request
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    // Add user message & placeholder
    setSessions(prev => prev.map(s => {
      if (s.id !== targetSessionId) return s;
      const newMsgs = [...s.messages, userMsg, botPlaceholder];
      const firstUser = newMsgs.find(m => m.role === 'user');
      return {
        ...s,
        messages: newMsgs,
        updatedAt: Date.now(),
        title: firstUser ? deriveSessionTitle(newMsgs) : s.title,
      };
    }));

    addLog('user', `Query: "${truncate(trimmed, 40)}"`);
    addLog('security', 'Sanitizing inputs & appending history context...');

    const startMs = performance.now();

    try {
      const response = await sendChatMessage(baseUrl, trimmed, history, controller.signal);

      if (!response.ok) {
        if (response.status === 429) throw new Error('RATE_LIMITED');
        if (response.status === 503) throw new Error('MAINTENANCE');
        if (response.status === 400) throw new Error('INVALID_REQUEST');
        throw new Error('SERVICE_UNAVAILABLE');
      }

      addLog('system', 'Stream established. Decoding chunks...');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      setIsTyping(false);

      let fullText = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (isFirstChunk) {
          const latency = Math.round(performance.now() - startMs);
          addLog('latency', `Stream response started. Latency: ${latency}ms`);
          isFirstChunk = false;
        }

        fullText += decoder.decode(value, { stream: true });

        // Functional update strictly targets targetSessionId
        setSessions(prev => prev.map(s => {
          if (s.id !== targetSessionId) return s;
          const msgs = s.messages.map(m =>
            m.id === botPlaceholder.id ? { ...m, content: fullText } : m
          );
          return { ...s, messages: msgs, updatedAt: Date.now() };
        }));

        const currentArtifact = extractArtifact(fullText);
        if (currentArtifact) setActiveArtifact(currentArtifact);
      }

      addLog('system', 'Stream transaction completed.');

    } catch (err) {
      if (err.name === 'AbortError') {
        addLog('system', 'Request cancelled by user.');
        return;
      }

      setIsTyping(false);
      let errMsg = '';
      if (err.message === 'RATE_LIMITED') errMsg = "⚠️ You're sending messages too fast. Please wait a moment.";
      else if (err.message === 'MAINTENANCE') errMsg = '🔧 The AI assistant is temporarily offline. Please check back later.';
      else if (err.message === 'INVALID_REQUEST') errMsg = '⚠️ Message validation failed. Please check your message length.';
      else errMsg = '⚠️ Unable to connect to AI assistant. Please try again.';

      addLog('error', `API failure: ${err.message}`);

      setSessions(prev => prev.map(s => {
        if (s.id !== targetSessionId) return s;
        const msgs = s.messages.map(m =>
          m.id === botPlaceholder.id ? { ...m, content: errMsg } : m
        );
        return { ...s, messages: msgs };
      }));
    } finally {
      isSendingRef.current = false;
      // Always reset isTyping — React no-ops if it's already false, so this
      // is safe in the success path (where it was already set to false before
      // the streaming loop) and correctly resets it in error / abort paths.
      setIsTyping(false);
      activeAbortControllerRef.current = null;
    }
    // `isTyping` removed from deps — handleSend was being recreated on every
    // typing state change. isSendingRef guards against double-sends instead.
  }, [baseUrl, activeSessionId, extractArtifact, addLog]);

  // Clean up any pending abort controllers on unmount
  useEffect(() => {
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        sessions,
        setSessions,
        activeSessionId,
        activeSession,
        messages,
        isTyping,
        aiStatus,
        recheckStatus,
        telemetryLogs,
        activeArtifact,
        setActiveArtifact,
        setTelemetryLogs,
        addLog,
        handleNewChat,
        handleSelectSession,
        handleDeleteSession,
        handlePinSession,
        handleClear,
        handleSend,
        updateActiveMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within a ChatProvider');
  return ctx;
}
