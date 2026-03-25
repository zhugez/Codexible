"use client";

import { useEffect, useState } from "react";
import {
  deleteCliproxyApiKey,
  getCliproxyApiKeys,
  getAdminStatus,
  addCliproxyApiKey,
  type AdminStatus,
  type CliproxyApiKey,
  type ValidateResponse,
  validateToken,
} from "@/app/lib/api";

interface CliproxyClientProps {
  token: string;
}

export function CliproxyClient({ token }: CliproxyClientProps) {
  const [auth, setAuth] = useState<ValidateResponse | null>(null);
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [keys, setKeys] = useState<CliproxyApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const [authInfo, statusInfo, keyList] = await Promise.all([
        validateToken(t),
        getAdminStatus(t),
        getCliproxyApiKeys(t),
      ]);
      setAuth(authInfo);
      setStatus(statusInfo);
      setKeys(keyList as CliproxyApiKey[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void loadData(token);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim()) return;
    setActionLoading(true);
    setActionMsg(null);
    try {
      await addCliproxyApiKey(token, newKey.trim());
      setNewKey("");
      setActionMsg("Key added successfully.");
      await loadData(token);
    } catch (err) {
      setActionMsg(err instanceof Error ? `Error: ${err.message}` : "Failed to add key");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteKey(key: string) {
    if (!confirm(`Delete this API key?\n\n${key.slice(0, 20)}...`)) return;
    setActionLoading(true);
    setActionMsg(null);
    try {
      await deleteCliproxyApiKey(token, key);
      setActionMsg("Key deleted.");
      await loadData(token);
    } catch (err) {
      setActionMsg(err instanceof Error ? `Error: ${err.message}` : "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <p className="text-[var(--text-secondary)]">Loading CliproxyAPI Management...</p>
      </main>
    );
  }

  if (!auth?.valid || auth.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">Forbidden</h1>
          <p className="mt-2 text-sm text-[var(--red)]">
            Admin privileges required.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">CliproxyAPI Management</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage upstream API keys and monitor CliproxyAPI integration.
          </p>
        </div>
        <a
          href="/dashboard/admin"
          className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        >
          Back to Admin
        </a>
      </div>

      {/* Integration status */}
      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Integration Status</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Upstream</p>
            <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
              {status?.integration.upstream_url ?? "—"}
            </p>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              status?.integration.upstream_reachable
                ? "bg-[var(--green)]/20 text-[var(--green)]"
                : "bg-[var(--red)]/20 text-[var(--red)]"
            }`}>
              {status?.integration.upstream_reachable ? "Reachable" : "Unreachable"}
            </span>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Management API</p>
            <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
              {status?.integration.management_url ?? "—"}
            </p>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              status?.integration.management_reachable
                ? "bg-[var(--green)]/20 text-[var(--green)]"
                : "bg-[var(--red)]/20 text-[var(--red)]"
            }`}>
              {status?.integration.management_reachable ? "Reachable" : "Unreachable"}
            </span>
          </div>
        </div>
        {status?.integration.last_error && (
          <p className="mt-3 text-sm text-[var(--red)]">
            Last error: {status.integration.last_error}
          </p>
        )}
      </section>

      {/* Add new key */}
      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add API Key</h2>
        <form onSubmit={handleAddKey} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Paste upstream API key (Bearer token)"
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
            disabled={actionLoading}
          />
          <button
            type="submit"
            disabled={actionLoading || !newKey.trim()}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {actionLoading ? "Adding..." : "Add Key"}
          </button>
        </form>
        {actionMsg && (
          <p className={`mt-3 text-sm ${actionMsg.startsWith("Error") ? "text-[var(--red)]" : "text-[var(--green)]"}`}>
            {actionMsg}
          </p>
        )}
      </section>

      {/* Key list */}
      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            API Keys ({keys.length})
          </h2>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] px-4 py-3 text-sm text-[var(--red)]">
            {error}
          </div>
        )}

        {keys.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">No API keys registered.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {keys.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-[var(--text-primary)]">
                    {item.value}
                  </p>
                  {item.label && (
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Label: {item.label}
                    </p>
                  )}
                  <div className="mt-1 flex gap-3 text-xs text-[var(--text-muted)]">
                    {item.created_at && <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>}
                    {item.last_used_at && <span>Last used: {new Date(item.last_used_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button
                  onClick={() => void handleDeleteKey(item.value)}
                  disabled={actionLoading}
                  className="ml-4 shrink-0 rounded-md border border-[var(--red-light)] px-3 py-1.5 text-xs text-[var(--red)] hover:bg-[var(--red-light)] disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
