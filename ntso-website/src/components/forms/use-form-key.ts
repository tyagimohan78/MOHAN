"use client";
import { useRef } from "react";

/** Remount the form after each server response so `defaultValue`s reflect the returned values. */
export function useFormKey(state: unknown) {
  const ref = useRef<{ state: unknown; n: number }>({ state, n: 0 });
  if (ref.current.state !== state) ref.current = { state, n: ref.current.n + 1 };
  return ref.current.n;
}
