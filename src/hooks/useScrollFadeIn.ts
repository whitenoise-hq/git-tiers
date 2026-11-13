'use client';

import { useEffect, useState } from 'react';

interface ScrollFadeInOptions {
  readonly threshold?: number;
  readonly delay?: number;
}

/**
 * 요소가 화면에 들어오면 delay 뒤 isVisible 을 true 로 바꾼다.
 *
 * [콜백 ref, isVisible] 을 돌려준다. 콜백 ref 는 state setter 라서 렌더 중에 ref 값을 읽지 않고,
 * 요소가 붙거나 바뀌면 effect 가 다시 실행된다.
 * 같은 콜백 ref 를 여러 요소에 붙이면 마지막 요소를 기준으로 하며, isVisible 은 함께 쓴다.
 */
export function useScrollFadeIn({ threshold = 0.15, delay = 0 }: ScrollFadeInOptions = {}) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!element) return undefined;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [element, threshold, delay]);

  return [setElement, isVisible] as const;
}
