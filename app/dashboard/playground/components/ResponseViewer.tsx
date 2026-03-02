import type { ApiResponse } from "../PlaygroundClient";

interface ResponseViewerProps {
    response: ApiResponse;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
    if (!response.status && !response.loading && !response.data) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                    Enter an endpoint and press Send to see the response here.
                </p>
            </div>
        );
    }

    const statusColor =
        response.status && response.status < 400
            ? "text-[var(--green)]"
            : "text-[var(--red)]";

    return (
        <div className="flex h-full flex-col gap-4">
            {response.loading && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                    Sending request...
                </div>
            )}

            {response.status && !response.loading && (
                <div className="flex items-center gap-4 border-b border-[var(--border)] pb-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                        Status: <span className={statusColor}>{response.status}</span>
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">Time: ~800ms</span>
                </div>
            )}

            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-code)] p-0 overflow-hidden">
                {response.data ? (
                    <pre className="h-full overflow-auto p-4 font-mono text-sm text-[#e5e7eb] dark:text-[#e5e7eb]">
                        <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(JSON.stringify(response.data, null, 2)) }} />
                    </pre>
                ) : (
                    <div className="flex h-full items-center justify-center p-4">
                        <span className="text-sm text-[var(--text-muted)]">No data</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple JSON syntax highlighter wrapper
function syntaxHighlight(json: string) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-[#3b82f6]'; // string
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-[#f472b6]'; // key
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-[#10b981]'; // boolean
        } else if (/null/.test(match)) {
            cls = 'text-[#ef4444]'; // null
        } else {
            cls = 'text-[#f59e0b]'; // number
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
