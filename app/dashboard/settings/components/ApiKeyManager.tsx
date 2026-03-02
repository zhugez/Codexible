import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Copy, Check, RefreshCcw } from "lucide-react";
import {
    createApiKey,
    listApiKeys,
    revokeApiKey,
    rotateApiKey,
    type ApiKeyItem,
} from "@/app/lib/api";

interface ApiKeyManagerProps {
    token: string;
}

export function ApiKeyManager({ token }: ApiKeyManagerProps) {
    const [keys, setKeys] = useState<ApiKeyItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});

    const sortedKeys = useMemo(
        () =>
            [...keys].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            ),
        [keys],
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await listApiKeys(token);
                if (!cancelled) {
                    setKeys(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load keys");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const handleGenerateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim() || submitting) {
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const created = await createApiKey(token, newKeyName.trim());
            setKeys((prev) => [
                {
                    id: created.id,
                    prefix: created.prefix,
                    label: created.label,
                    status: "active",
                    created_at: new Date().toISOString(),
                    last_used_at: null,
                },
                ...prev,
            ]);
            setRevealedSecrets((prev) => ({ ...prev, [created.id]: created.key }));
            setNewKeyName("");
            setIsGenerating(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create key");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevokeKey = async (id: string) => {
        if (submitting) {
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await revokeApiKey(token, id);
            setKeys((prev) => prev.filter((k) => k.id !== id));
            setRevealedSecrets((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to revoke key");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRotateKey = async (id: string) => {
        if (submitting) {
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const rotated = await rotateApiKey(token, id);
            setKeys((prev) =>
                prev.map((key) =>
                    key.id === id
                        ? {
                            ...key,
                            prefix: rotated.prefix,
                            label: rotated.label,
                            status: "active",
                            created_at: new Date().toISOString(),
                            last_used_at: null,
                        }
                        : key,
                ),
            );
            setRevealedSecrets((prev) => ({ ...prev, [id]: rotated.key }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to rotate key");
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = async (id: string, text: string | undefined) => {
        if (!text) {
            setError("Only newly created/rotated secrets can be copied from this view.");
            return;
        }

        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (iso: string) =>
        new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(iso));

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">API Keys</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Server-backed token management. Full secrets are only shown right after create/rotate.
                    </p>
                </div>
                <button
                    onClick={() => setIsGenerating(!isGenerating)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-light)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)] disabled:opacity-60"
                    style={{ backgroundColor: "var(--accent)" }}
                    disabled={submitting}
                >
                    <Plus className="h-4 w-4" />
                    Create new secret key
                </button>
            </div>

            {isGenerating && (
                <form onSubmit={handleGenerateKey} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                    <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Name (e.g. My App Prod)"
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!newKeyName.trim() || submitting}
                        className="rounded-md bg-[#222222] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-[#eeeeee] dark:text-black"
                    >
                        Create
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsGenerating(false)}
                        className="rounded-md border border-[var(--border)] bg-transparent px-4 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {error && <p className="rounded-lg border border-[var(--red-light)] bg-[var(--red-light)] px-3 py-2 text-sm text-[var(--red)]">{error}</p>}

            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                        <tr>
                            <th className="px-4 py-3 font-medium">NAME</th>
                            <th className="px-4 py-3 font-medium">KEY PREVIEW</th>
                            <th className="px-4 py-3 font-medium">CREATED</th>
                            <th className="px-4 py-3 font-medium">LAST USED</th>
                            <th className="px-4 py-3 font-medium text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                    Loading keys...
                                </td>
                            </tr>
                        ) : sortedKeys.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                    You don&apos;t have any API keys yet.
                                </td>
                            </tr>
                        ) : (
                            sortedKeys.map((key) => {
                                const secret = revealedSecrets[key.id];
                                return (
                                    <tr key={key.id} className="transition-colors hover:bg-[var(--bg-secondary)]">
                                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{key.label}</td>
                                        <td className="px-4 py-3 font-mono text-[var(--text-secondary)]">
                                            {secret ? `${secret.slice(0, 10)}...${secret.slice(-4)}` : `${key.prefix}...`}
                                        </td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(key.created_at)}</td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                                            {key.last_used_at ? formatDate(key.last_used_at) : "Never"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => void copyToClipboard(key.id, secret)}
                                                    className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                                                    title={secret ? "Copy key" : "No full secret available"}
                                                >
                                                    {copiedId === key.id ? <Check className="h-4 w-4 text-[var(--green)]" /> : <Copy className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => void handleRotateKey(key.id)}
                                                    className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                                                    title="Rotate key"
                                                >
                                                    <RefreshCcw className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => void handleRevokeKey(key.id)}
                                                    className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--red-light)] hover:text-[var(--red)]"
                                                    title="Revoke key"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
