"use client";

import { useState, useCallback } from "react";

type CopyState = "idle" | "success" | "error";

interface UseCopyToClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  state: CopyState;
  reset: () => void;
}

/**
 * Hook to copy text to clipboard with state management
 */
export function useCopyToClipboard(
  resetDelay = 2000
): UseCopyToClipboardReturn {
  const [state, setState] = useState<CopyState>("idle");

  const reset = useCallback(() => {
    setState("idle");
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) return false;

      try {
        await navigator.clipboard.writeText(text);
        setState("success");
        setTimeout(reset, resetDelay);
        return true;
      } catch {
        // Fallback for older browsers / denied permissions
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.cssText =
          "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        let success = false;
        try {
          success = document.execCommand("copy");
        } catch {
          success = false;
        } finally {
          document.body.removeChild(textarea);
        }

        setState(success ? "success" : "error");
        setTimeout(reset, resetDelay);
        return success;
      }
    },
    [resetDelay, reset]
  );

  return { copy, state, reset };
}
