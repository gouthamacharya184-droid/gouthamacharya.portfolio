import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatMessages({
  messages = [],
  fullscreen = false,
  isTyping = false,
  speakingMsgId = null,
  onToggleSpeech = null,
  scrollRef = null,
  onSelectArtifact = null,
  activeArtifact = null,
  onScroll = null
}) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`flex-1 overflow-y-auto px-5 py-6 ${
        fullscreen ? 'fullscreen-scroll' : 'widget-scroll'
      }`}
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      <div className="space-y-4 pb-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id || i}
            msg={msg}
            fullscreen={fullscreen}
            isLast={i === messages.length - 1 && msg.role === 'bot'}
            speakingMsgId={speakingMsgId}
            onToggleSpeech={onToggleSpeech}
            onSelectArtifact={onSelectArtifact}
            activeArtifact={activeArtifact}
          />
        ))}
      </div>
    </div>
  );
}
