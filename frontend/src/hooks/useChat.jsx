import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { sendChatMessage } from '../utils/chatApi';
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
  const baseUrl = (apiBaseUrl || '').replace(/\/$/, '') || window.location.origin;

  const [sessions, setSessions] = useState([INITIAL_SESSION]);
  const [activeSessionId, setActiveSessionId] = useState(INITIAL_SESSION.id);
  const [isTyping, setIsTyping] = useState(false);
  const isSendingRef = useRef(false);
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
    const s = makeSession('New Chat');
    setSessions(prev => [s, ...prev]);
    setActiveSessionId(s.id);
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

  const handleSend = useCallback(async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || isTyping || isSendingRef.current) return;

    const userMsg = { role: 'user', content: trimmed, timestamp: Date.now(), id: makeId() };
    const botPlaceholder = { role: 'bot', content: '', timestamp: Date.now(), id: makeId() };

    isSendingRef.current = true;
    updateActiveMessages(prev => [...prev, userMsg, botPlaceholder]);
    setIsTyping(true);

    addLog('user', `Query: "${truncate(trimmed, 40)}"`);
    addLog('security', 'Sanitizing inputs & checking overrides...');

    const startMs = performance.now();

    try {
      const response = await sendChatMessage(baseUrl, trimmed);

      if (!response.ok) {
        if (response.status === 429) throw new Error('RATE_LIMITED');
        if (response.status === 503) throw new Error('MAINTENANCE');
        if (response.status === 400) throw new Error('INVALID_REQUEST');
        throw new Error('SERVICE_UNAVAILABLE');
      }

      addLog('system', 'Stream established. Decoding chunks...');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
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

        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
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
      setIsTyping(false);
      let errMsg = '';
      if (err.message === 'RATE_LIMITED')     errMsg = "⚠️ You're sending messages too fast. Please wait a moment.";
      else if (err.message === 'MAINTENANCE') errMsg = '🔧 The AI assistant is temporarily offline. Please check back later.';
      else if (err.message === 'INVALID_REQUEST') errMsg = '⚠️ Message validation failed. Please check your message length.';
      else errMsg = '⚠️ Unable to connect to backend server. Please check your network connection.';

      addLog('error', `API failure: ${err.message}`);

      setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        let msgs;
        if (errMsg) {
          msgs = s.messages.map(m =>
            m.id === botPlaceholder.id ? { ...m, content: errMsg } : m
          );
        } else {
          msgs = s.messages.filter(m => m.id !== botPlaceholder.id);
        }
        return { ...s, messages: msgs };
      }));
    } finally {
      isSendingRef.current = false;
    }
  }, [isTyping, baseUrl, activeSessionId, updateActiveMessages, extractArtifact, addLog]);

  return (
    <ChatContext.Provider
      value={{
        sessions,
        setSessions,
        activeSessionId,
        activeSession,
        messages,
        isTyping,
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
