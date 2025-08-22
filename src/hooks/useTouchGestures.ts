// src/hooks/useTouchGestures.ts
import { useRef, useEffect, useState, TouchEvent } from 'react';

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
}

interface TouchGestureOptions {
  minSwipeDistance: number;
  maxSwipeTime: number;
  preventScroll: boolean;
}

const defaultOptions: TouchGestureOptions = {
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  preventScroll: false,
};

export const useTouchGestures = (
  onSwipe?: (swipe: SwipeDirection) => void,
  onTap?: () => void,
  onLongPress?: () => void,
  options: Partial<TouchGestureOptions> = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();
  const [isPressed, setIsPressed] = useState(false);

  const config = { ...defaultOptions, ...options };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (config.preventScroll) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      setIsPressed(true);

      // Set long press timer
      if (onLongPress) {
        longPressTimeoutRef.current = setTimeout(() => {
          onLongPress();
          setIsPressed(false);
        }, 500);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (config.preventScroll) {
        e.preventDefault();
      }

      // Cancel long press if finger moves
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = undefined;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      setIsPressed(false);

      // Clear long press timer
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = undefined;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Determine if it's a tap or swipe
      if (distance < 10 && deltaTime < 200) {
        onTap?.();
      } else if (distance >= config.minSwipeDistance && deltaTime <= config.maxSwipeTime) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        let direction: SwipeDirection['direction'] = null;

        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        onSwipe?.({ direction, distance, velocity });
      }

      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart as any);
    element.addEventListener('touchmove', handleTouchMove as any);
    element.addEventListener('touchend', handleTouchEnd as any);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as any);
      element.removeEventListener('touchmove', handleTouchMove as any);
      element.removeEventListener('touchend', handleTouchEnd as any);
      
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [onSwipe, onTap, onLongPress, config]);

  return { elementRef, isPressed };
};
