"use client";
import { useEffect, useRef } from "react";

/** Remount the form after each server response so `defaultValue`s reflect the returned values. */
export function useFormKey(state: unknown) {
  const ref = useRef<{ state: unknown; n: number }>({ state, n: 0 });
  if (ref.current.state !== state) ref.current = { state, n: ref.current.n + 1 };
  return ref.current.n;
}

/**
 * After a failed submission, move keyboard/screen-reader focus to the first invalid field
 * (or to the form-level error message) so users are not left at the submit button.
 */
export function useFocusFirstError(state: { ok?: boolean; errors?: Record<string, string>; message?: string }, formId: string) {
  useEffect(() => {
    if (state.ok || (!state.errors && !state.message)) return;
    const form = document.getElementById(formId);
    if (!form) return;
    const target = form.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]') || form.querySelector<HTMLElement>('[role="alert"]');
    if (target) {
      if (target.getAttribute("role") === "alert") target.setAttribute("tabindex", "-1");
      target.focus();
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [state, formId]);
}
