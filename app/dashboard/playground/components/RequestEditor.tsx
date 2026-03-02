import { Play } from "lucide-react";
import type { ApiRequest, HttpMethod } from "../PlaygroundClient";

interface RequestEditorProps {
    request: ApiRequest;
    onChange: (request: ApiRequest) => void;
    onSend: () => void;
    isLoading: boolean;
}

export function RequestEditor({ request, onChange, onSend, isLoading }: RequestEditorProps) {
    const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex gap-2">
                <select
                    value={request.method}
                    onChange={(e) => onChange({ ...request, method: e.target.value as HttpMethod })}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                >
                    {methods.map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={request.url}
                    onChange={(e) => onChange({ ...request, url: e.target.value })}
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="https://api.example.com/v1/..."
                />
                <button
                    onClick={onSend}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg bg-[var(--accent-light)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent)" }}
                >
                    {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <Play className="h-4 w-4" />
                    )}
                    Send
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Headers (JSON)</label>
                <textarea
                    value={request.headers}
                    onChange={(e) => onChange({ ...request, headers: e.target.value })}
                    className="h-24 resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-code)] p-3 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                />
            </div>

            <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Body (JSON)</label>
                <textarea
                    value={request.body}
                    onChange={(e) => onChange({ ...request, body: e.target.value })}
                    className="flex-1 min-h-[150px] resize-y rounded-lg border border-[var(--border)] bg-[var(--bg-code)] p-3 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                />
            </div>
        </div>
    );
}
