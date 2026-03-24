"use client";

import { useState } from "react";
import { User, Key, Settings as SettingsIcon } from "lucide-react";
import { ApiKeyManager } from "./components/ApiKeyManager";
import { DashboardLayout } from "../components/DashboardLayout";

type Tab = "profile" | "keys" | "preferences";

interface AccountData {
  owner: string;
  plan: string;
  status: string;
  dailyLimit: number;
  balance: number;
  role: "user" | "admin" | string;
}

interface SettingsPageClientProps {
  token: string;
  accountData: AccountData | null;
}

export function SettingsPageClient({ token: tokenFromUrl, accountData }: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Prefer URL token (backward compat), fall back to localStorage
  const [token] = useState(
    () =>
      tokenFromUrl ||
      (typeof window !== "undefined"
        ? localStorage.getItem("codexible_token") ?? ""
        : ""),
  );

  const displayAccount = accountData ?? {
    owner: "—",
    plan: "—",
    status: "unknown",
    dailyLimit: 0,
    balance: 0,
    role: "user",
  };

  return (
    <DashboardLayout
      accountData={displayAccount}
      title="Settings"
      subtitle="Manage your profile, API keys, and preferences."
      tabs={
        <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-1 w-fit">
          <TabButton icon={User} label="Profile" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
          <TabButton icon={Key} label="API Keys" isActive={activeTab === "keys"} onClick={() => setActiveTab("keys")} />
          <TabButton icon={SettingsIcon} label="Preferences" isActive={activeTab === "preferences"} onClick={() => setActiveTab("preferences")} />
        </div>
      }
    >
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Profile</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{displayAccount.owner}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Plan: {displayAccount.plan}</p>
          <div className="mt-6 flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
            <span className="text-sm text-[var(--text-muted)]">Profile settings coming soon...</span>
          </div>
        </div>
      )}

      {activeTab === "keys" && <ApiKeyManager token={token} />}

      {activeTab === "preferences" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Preferences</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Customize your workspace and notification settings.
          </p>
          <div className="mt-6 flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
            <span className="text-sm text-[var(--text-muted)]">Preferences coming soon...</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function TabButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
