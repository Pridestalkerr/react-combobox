import {
  FC,
  useState,
  useRef,
  KeyboardEvent,
  useMemo,
  useCallback,
  useEffect,
  RefObject,
  CSSProperties,
} from "react";

export const useId = () => {};

type EventHandler = (event: MouseEvent | TouchEvent) => void;

export function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: EventHandler
): void {
  useEffect(() => {
    const mouseListener = (event: MouseEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    const touchListener = (event: TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", mouseListener);
    document.addEventListener("touchstart", touchListener);
    return () => {
      document.removeEventListener("mousedown", mouseListener);
      document.removeEventListener("touchstart", touchListener);
    };
  }, [ref, handler]);
}
