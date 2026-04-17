'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollFadeInOptions {
  readonly threshold?: number;
  readonly delay?: number;
}

export function useScrollFadeIn({ threshold = 0.15, delay = 0 }: ScrollFadeInOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(element);
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, delay]);

  return { ref, isVisible };
}
