import { useRef, useEffect, useState, useCallback } from 'react';

export function useAutoScroll(dependency) {
  const scrollRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Show button if user scrolls up more than 200px from the bottom
    const isCloseToBottom = scrollHeight - scrollTop - clientHeight < 200;
    setShowScrollButton(!isCloseToBottom);
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [dependency, scrollToBottom]);

  return {
    scrollRef,
    showScrollButton,
    scrollToBottom,
    handleScroll
  };
}
