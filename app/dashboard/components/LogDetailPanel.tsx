import { X } from "lucide-react";
import type { RecentActivity } from "@/app/lib/api";

interface LogDetailPanelProps {
    log: RecentActivity | null;
    onClose: () => void;
}

export function LogDetailPanel({ log, onClose }: LogDetailPanelProps) {
    if (!log) return null;

    // Request/Response data from the log entry
    const requestData = {
        method: "POST",
        url: "https://api.codexible.com/v1/chat/completions",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer [token]"
        },
        body: {
            model: log.model,
            messages: "[request body not stored]",
            temperature: 0.7
        }
    };

    const responseData = {
        id: `req-${log.id}`,
        object: "chat.completion",
        created: Math.floor(new Date(log.createdAt).getTime() / 1000),
        model: log.model,
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: "[response content not stored]"
                },
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: log.promptTokens,
            completion_tokens: log.completionTokens,
            total_tokens: log.promptTokens + log.completionTokens
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            {/* Slide-over panel */}
            <div className="w-full max-w-2xl bg-[var(--bg-primary)] shadow-2xl h-full flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Log Details</h2>
                        <p className="text-sm text-[var(--text-muted)] truncate">{log.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-[var(--text-muted)] mb-1">Model</span>
                            <span className="font-mono text-[var(--text-primary)]">{log.model}</span>
                        </div>
                        <div>
                            <span className="block text-[var(--text-muted)] mb-1">Time</span>
                            <span className="text-[var(--text-primary)]">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-[var(--text-muted)] mb-1">Cost</span>
                            <span className="text-[var(--green)]">${log.costUSD.toFixed(5)}</span>
                        </div>
                        <div>
                            <span className="block text-[var(--text-muted)] mb-1">Tokens (Prompt / Completion)</span>
                            <span className="text-[var(--text-primary)]">{log.promptTokens} / {log.completionTokens}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Request</h3>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-code)] p-0 overflow-hidden">
                            <pre className="p-4 font-mono text-xs text-[#e5e7eb] overflow-x-auto">
                                {JSON.stringify(requestData, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Response</h3>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-code)] p-0 overflow-hidden">
                            <pre className="p-4 font-mono text-xs text-[#e5e7eb] overflow-x-auto">
                                {JSON.stringify(responseData, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

