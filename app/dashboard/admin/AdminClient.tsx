"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminCreateToken,
  adminRevokeToken,
  adminRotateToken,
  getAdminLogs,
  getAdminStatus,
  getAdminTokens,
  getAdminUsers,
  type AdminAuditEvent,
  type AdminStatus,
  type AdminToken,
  type AdminUser,
  type ValidateResponse,
  validateToken,
} from "@/app/lib/api";

interface AdminClientProps {
  token: string;
}

export function AdminClient({ token: tokenFromUrl }: AdminClientProps) {
  // Prefer URL token (backward compat for direct links), fall back to localStorage
  const [token] = useState(
    () => tokenFromUrl || (typeof window !== "undefined" ? localStorage.getItem("codexible_token") ?? "" : ""),
  );
  const [auth, setAuth] = useState<ValidateResponse | null>(null);
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [logs, setLogs] = useState<AdminAuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        (user.name ?? "").toLowerCase().includes(query),
    );
  }, [search, users]);

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return tokens;
    }
    return tokens.filter(
      (item) =>
        item.user_email.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.prefix.toLowerCase().includes(query),
    );
  }, [search, tokens]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [authInfo, statusInfo, userItems, tokenItems, logItems] = await Promise.all([
        validateToken(token),
        getAdminStatus(token),
        getAdminUsers(token),
        getAdminTokens(token),
        getAdminLogs(token),
      ]);

      setAuth(authInfo);
      setStatus(statusInfo);
      setUsers(userItems);
      setTokens(tokenItems);
      setLogs(logItems);

      // Set initial user selection after data loads — avoids stale closure
      const firstUser = userItems[0];
      if (firstUser) {
        setSelectedUserId((prev) => prev || firstUser.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    setError(null);
    try {
      await adminCreateToken(token, selectedUserId, newLabel || undefined);
      setNewLabel("");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    }
  };

  const handleRotate = async (id: string) => {
    setError(null);
    try {
      await adminRotateToken(token, id);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rotate token");
    }
  };

  const handleRevoke = async (id: string) => {
    setError(null);
    try {
      await adminRevokeToken(token, id);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke token");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-6">
        <p className="text-[var(--text-secondary)]">Loading Admin Center...</p>
      </main>
    );
  }

  if (!auth?.valid || auth.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">Forbidden</h1>
          <p className="mt-2 text-sm text-[var(--red)]">
            This token does not have admin privileges.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">Admin Center</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            CPAMC-oriented management for users, tokens, integration status, and audit logs.
          </p>
        </div>
        <a
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        >
          Back to Dashboard
        </a>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] px-4 py-3 text-sm text-[var(--red)]">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Users" value={String(status?.user_count ?? 0)} />
        <StatCard label="Active Tokens" value={String(status?.active_token_count ?? 0)} />
        <StatCard label="Credits Today" value={String(status?.today_credits_used ?? 0)} />
        <StatCard
          label="Integration"
          value={
            status?.integration.enabled
              ? status.integration.upstream_reachable
                ? "healthy"
                : "degraded"
              : "disabled"
          }
        />
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Integration Status</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Upstream: {status?.integration.upstream_url} | Management: {status?.integration.management_url}
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Upstream reachable: {String(status?.integration.upstream_reachable ?? false)} | Management reachable: {String(status?.integration.management_reachable ?? false)}
        </p>
        {status?.integration.last_error && (
          <p className="mt-1 text-sm text-[var(--red)]">Last error: {status.integration.last_error}</p>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">User & Token Management</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users/tokens"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </div>

        <form onSubmit={handleCreateToken} className="mt-4 flex flex-col gap-2 md:flex-row">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.plan})
              </option>
            ))}
          </select>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Optional token label"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Create Token
          </button>
        </form>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)]">
            <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
              Users
            </div>
            <div className="max-h-72 overflow-auto">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border-b border-[var(--border)] px-4 py-3 text-sm">
                  <p className="font-medium text-[var(--text-primary)]">{user.email}</p>
                  <p className="text-[var(--text-secondary)]">
                    {user.plan} • {user.status} • {user.key_count} keys
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)]">
            <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
              Tokens
            </div>
            <div className="max-h-72 overflow-auto">
              {filteredTokens.map((item) => (
                <div key={item.id} className="border-b border-[var(--border)] px-4 py-3 text-sm">
                  <p className="font-medium text-[var(--text-primary)]">{item.user_email}</p>
                  <p className="text-[var(--text-secondary)]">
                    {item.prefix}... • {item.label} • {item.status}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleRotate(item.id)}
                      className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    >
                      Rotate
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRevoke(item.id)}
                      className="rounded-md border border-[var(--red-light)] px-2 py-1 text-xs text-[var(--red)] hover:bg-[var(--red-light)]"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Audit Logs</h2>
        <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
          {logs.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">No audit logs yet.</p>
          ) : (
            logs.map((log, index) => (
              <div key={`${log.timestamp}-${index}`} className="border-b border-[var(--border)] px-4 py-3 text-sm">
                <p className="font-medium text-[var(--text-primary)]">
                  {log.action} • {log.actor}
                </p>
                <p className="text-[var(--text-secondary)]">{log.target}</p>
                <p className="text-[var(--text-muted)]">{log.details}</p>
                <p className="text-xs text-[var(--text-muted)]">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
