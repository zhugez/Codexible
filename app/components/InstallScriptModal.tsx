"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  scriptText: string;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
};

async function copyToClipboard(text: string) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / denied perms
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

export function InstallScriptModal({ open, onClose, scriptText, loading, error, onRefresh }: Props) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Note: component is conditionally mounted by the parent when `open` is true,
  // so local state resets on close without needing setState-in-effect.

  const statusText = useMemo(() => {
    if (loading) return "Fetching install.sh…";
    if (error) return error;
    if (copied === "ok") return "Copied";
    if (copied === "fail") return "Copy failed";
    if (scriptText) return `${scriptText.length.toLocaleString()} bytes`;
    return "";
  }, [loading, error, copied, scriptText]);

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
            <div className="mt-0.5 text-xs text-[#667085]">Fetched from /install.sh (same origin)</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRefresh?.()}
              className="rounded-xl border border-[#d7dee7] bg-white px-3 py-2 text-xs font-semibold text-[#111827] transition hover:bg-[#f8fafc]"
              disabled={loading}
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(scriptText);
                setCopied(ok ? "ok" : "fail");
                setTimeout(() => setCopied("idle"), 2000);
              }}
              className="rounded-xl bg-[#e07a45] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              disabled={loading || !scriptText}
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
            <code>{loading ? "" : scriptText || (error ? "" : "(empty)")}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
