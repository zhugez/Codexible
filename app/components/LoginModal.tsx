"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { findToken } from "@/app/lib";
import type { Translation } from "@/app/types";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  t: Translation;
}

export function LoginModal({ open, onClose, t }: LoginModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setApiKey("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleSubmit = () => {
    const record = findToken(apiKey);
    if (record) {
      localStorage.setItem("codexible_token", apiKey);
      onClose();
      router.push(`/dashboard?token=${encodeURIComponent(apiKey)}`);
    } else {
      setError(t.loginModal.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-auto mt-[20vh] w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{t.loginModal.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <input
            ref={inputRef}
            type="text"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder={t.loginModal.placeholder}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          />

          {error && (
            <p className="mt-2 text-sm text-[var(--red)]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)]"
          >
            {t.loginModal.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {t.loginModal.login}
          </button>
        </div>
      </div>
    </div>
  );
}
