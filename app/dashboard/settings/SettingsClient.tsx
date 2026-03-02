"use client";

import { useState } from "react";
import { User, Key, Settings as SettingsIcon } from "lucide-react";
import { ApiKeyManager } from "./components/ApiKeyManager";

type Tab = "profile" | "keys" | "preferences";

interface SettingsClientProps {
    token: string;
}

export function SettingsClient({ token }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>("keys");

    return (
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Sidebar Navigation */}
            <nav className="flex w-full flex-row gap-2 overflow-x-auto border-b border-[var(--border)] pb-4 md:w-64 md:flex-col md:border-b-0 md:border-r md:pb-0 md:pr-4">
                <TabButton
                    icon={User}
                    label="Profile"
                    isActive={activeTab === "profile"}
                    onClick={() => setActiveTab("profile")}
                />
                <TabButton
                    icon={Key}
                    label="API Keys"
                    isActive={activeTab === "keys"}
                    onClick={() => setActiveTab("keys")}
                />
                <TabButton
                    icon={SettingsIcon}
                    label="Preferences"
                    isActive={activeTab === "preferences"}
                    onClick={() => setActiveTab("preferences")}
                />
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                {activeTab === "profile" && (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Profile Settings</h2>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            Manage your personal information and email preferences.
                        </p>
                        <div className="mt-6 flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
                            <span className="text-sm text-[var(--text-muted)]">Profile settings coming soon...</span>
                        </div>
                    </div>
                )}

                {activeTab === "keys" && (
                    <ApiKeyManager token={token} />
                )}

                {activeTab === "preferences" && (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Preferences</h2>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            Customize your workspace and notification settings.
                        </p>
                        <div className="mt-6 flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
                            <span className="text-sm text-[var(--text-muted)]">Preferences coming soon...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ icon: Icon, label, isActive, onClick }: { icon: any; label: string; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? "bg-[var(--accent-light)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                }`}
            style={isActive ? { backgroundColor: "var(--accent)" } : {}}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}
