import React from 'react';
import ChatbotPage from '../pages/Chatbot';

/**
 * Chatbot entry-point.
 * Re-exports the modularized ChatbotPage to ensure compatibility with all existing imports.
 */
export default function Chatbot(props) {
  return <ChatbotPage {...props} />;
}