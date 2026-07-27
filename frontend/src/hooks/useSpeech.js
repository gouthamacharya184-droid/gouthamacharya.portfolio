import { useState, useEffect, useCallback } from 'react';

export function useSpeech() {
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const handleToggleSpeech = useCallback((msgId, text, rate = 1.0) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis?.cancel();
      // Strip markdown syntax symbols before voicing
      const cleanText = text.replace(/[*#_`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis?.speak(utterance);
      setSpeakingMsgId(msgId);
    }
  }, [speakingMsgId]);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeakingMsgId(null);
  }, []);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    speakingMsgId,
    handleToggleSpeech,
    stopSpeech
  };
}
