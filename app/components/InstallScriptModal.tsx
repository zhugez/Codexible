"use client";

import { useEffect } from "react";
import { useCopyToClipboard } from "@/app/hooks";

type Props = {
  open: boolean;
  onClose: () => void;
  scriptText: string;
};

export function InstallScriptModal({ open, onClose, scriptText }: Props) {
  const { copy, state } = useCopyToClipboard();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const statusText =
    state === "success"
      ? "Copied"
      : state === "error"
        ? "Copy failed"
        : scriptText
          ? `${scriptText.length.toLocaleString()} bytes`
          : "";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative mx-auto mt-[6vh] w-[min(980px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <div className="text-base font-extrabold text-black">install.sh</div>
            <div className="mt-0.5 text-xs text-[#667085]">Embedded on page (no fetch)</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copy(scriptText)}
              className="rounded-xl bg-[#e07a45] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              disabled={!scriptText}
            >
              Copy
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-xl border border-[#d7dee7] bg-white px-3 py-2 text-xs font-semibold text-[#111827] transition hover:bg-[#f8fafc]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="mb-3 text-xs text-[#667085]">{statusText}</div>

          <pre className="max-h-[68vh] overflow-auto rounded-xl border border-[#1f2937] bg-[#0b1020] p-4 text-xs text-[#8de0ff]">
            <code>{scriptText || "(empty)"}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
