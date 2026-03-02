"use client";

import { useState } from "react";
import { RequestEditor } from "./components/RequestEditor";
import { ResponseViewer } from "./components/ResponseViewer";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiRequest {
    method: HttpMethod;
    url: string;
    headers: string;
    body: string;
}

export interface ApiResponse {
    status: number | null;
    data: any | null;
    error: string | null;
    loading: boolean;
}

export function PlaygroundClient() {
    const [request, setRequest] = useState<ApiRequest>({
        method: "POST",
        url: "https://api.codexible.com/v1/chat/completions",
        headers: "{\n  \"Content-Type\": \"application/json\",\n  \"Authorization\": \"Bearer YOUR_API_KEY\"\n}",
        body: "{\n  \"model\": \"gpt-4\",\n  \"messages\": [\n    { \"role\": \"user\", \"content\": \"Hello!\" }\n  ]\n}",
    });

    const [response, setResponse] = useState<ApiResponse>({
        status: null,
        data: null,
        error: null,
        loading: false,
    });

    const handleSendRequest = async () => {
        setResponse({ ...response, loading: true, error: null });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock response based on the endpoint
        if (request.url.includes("/chat/completions")) {
            setResponse({
                status: 200,
                data: {
                    id: "chatcmpl-123",
                    object: "chat.completion",
                    created: Date.now() / 1000,
                    model: "gpt-4",
                    choices: [
                        {
                            index: 0,
                            message: {
                                role: "assistant",
                                content: "Hello there! How can I assist you today?",
                            },
                            finish_reason: "stop",
                        },
                    ],
                    usage: {
                        prompt_tokens: 10,
                        completion_tokens: 10,
                        total_tokens: 20,
                    },
                },
                error: null,
                loading: false,
            });
        } else {
            setResponse({
                status: 404,
                data: {
                    error: {
                        message: "Endpoint not found in mock data",
                        type: "invalid_request_error",
                    },
                },
                error: null,
                loading: false,
            });
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Pane: Request Editor */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Configure Request</h2>
                <RequestEditor
                    request={request}
                    onChange={setRequest}
                    onSend={handleSendRequest}
                    isLoading={response.loading}
                />
            </div>

            {/* Right Pane: Response Viewer */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Response</h2>
                <ResponseViewer response={response} />
            </div>
        </div>
    );
}
