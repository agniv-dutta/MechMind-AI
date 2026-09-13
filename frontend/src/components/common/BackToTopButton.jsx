import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const updateVisibility = (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const scrollTop = target?.scrollTop ?? window.scrollY;
      if (target && scrollTop > 0) scrollContainerRef.current = target;
      setVisible(scrollTop > 300);
    };
    // Workspace pages use their own scroll containers, so listen in capture mode.
    document.addEventListener('scroll', updateVisibility, { passive: true, capture: true });
    return () => document.removeEventListener('scroll', updateVisibility, true);
  }, []);

  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => (scrollContainerRef.current || window).scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-teal-600 p-3 text-white shadow-lg transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
