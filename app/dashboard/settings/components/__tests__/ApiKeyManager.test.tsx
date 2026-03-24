import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/api", () => ({
  listApiKeys: vi.fn(),
  createApiKey: vi.fn(),
  revokeApiKey: vi.fn(),
  rotateApiKey: vi.fn(),
}));

import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  rotateApiKey,
} from "@/app/lib/api";
import { ApiKeyManager } from "../ApiKeyManager";

const mockListApiKeys = vi.mocked(listApiKeys);
const mockCreateApiKey = vi.mocked(createApiKey);
const mockRevokeApiKey = vi.mocked(revokeApiKey);
const mockRotateApiKey = vi.mocked(rotateApiKey);

describe("ApiKeyManager server-backed workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListApiKeys.mockResolvedValue([
      {
        id: "k1",
        prefix: "codexible_demo",
        label: "Primary Key",
        status: "active",
        created_at: "2026-03-01T00:00:00Z",
        last_used_at: null,
      },
    ]);
  });

  it("loads keys from backend on mount", async () => {
    render(<ApiKeyManager token="sk-demo" />);

    await waitFor(() => {
      expect(mockListApiKeys).toHaveBeenCalledWith("sk-demo");
      expect(screen.getByText(/primary key/i)).toBeInTheDocument();
    });
  });

  it("creates a key through backend API", async () => {
    mockCreateApiKey.mockResolvedValue({
      id: "k2",
      key: "codexible_new_secret_key_1234",
      prefix: "codexible_new",
      label: "New Key",
    });

    render(<ApiKeyManager token="sk-demo" />);
    await screen.findByText(/primary key/i);

    fireEvent.click(screen.getByRole("button", { name: /create new secret key/i }));
    fireEvent.change(screen.getByPlaceholderText(/my app prod/i), {
      target: { value: "New Key" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(mockCreateApiKey).toHaveBeenCalledWith("sk-demo", "New Key");
      expect(screen.getByText(/new key/i)).toBeInTheDocument();
    });
  });

  it("revokes a key through backend API", async () => {
    mockRevokeApiKey.mockResolvedValue();
    render(<ApiKeyManager token="sk-demo" />);
    await screen.findByText(/primary key/i);

    fireEvent.click(screen.getByTitle(/revoke key/i));

    await waitFor(() => {
      expect(mockRevokeApiKey).toHaveBeenCalledWith("sk-demo", "k1");
      expect(screen.queryByText(/primary key/i)).not.toBeInTheDocument();
    });
  });

  it("rotates a key through backend API", async () => {
    mockRotateApiKey.mockResolvedValue({
      id: "k1",
      key: "codexible_rotated_secret_5678",
      prefix: "codexible_rot",
      label: "Primary Key",
    });
    render(<ApiKeyManager token="sk-demo" />);
    await screen.findByText(/primary key/i);

    fireEvent.click(screen.getByTitle(/rotate key/i));

    await waitFor(() => {
      expect(mockRotateApiKey).toHaveBeenCalledWith("sk-demo", "k1");
    });
  });
});
