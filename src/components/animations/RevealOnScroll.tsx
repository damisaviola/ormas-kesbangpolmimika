'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';

export type AnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'fade';

interface RevealOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number; // ms
  duration?: number; // ms
  threshold?: number; // 0 to 1
  className?: string;
  as?: React.ElementType;
}

export default function RevealOnScroll({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.12,
  className = '',
  as: Component = 'div',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Unobserve immediately once revealed (Zero lag & zero memory overhead)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px', // Trigger slightly before it hits view
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  // Initial transform classes according to animation type
  const getInitialClass = () => {
    switch (animation) {
      case 'fade-up':
        return 'translate-y-8 opacity-0';
      case 'fade-down':
        return '-translate-y-8 opacity-0';
      case 'fade-left':
        return '-translate-x-8 opacity-0';
      case 'fade-right':
        return 'translate-x-8 opacity-0';
      case 'zoom-in':
        return 'scale-95 opacity-0';
      case 'fade':
      default:
        return 'opacity-0';
    }
  };

  const activeClass = isVisible
    ? 'translate-y-0 translate-x-0 scale-100 opacity-100'
    : getInitialClass();

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={`transform-gpu transition-all ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] ${activeClass} ${className}`}
    >
      {children}
    </Component>
  );
}

