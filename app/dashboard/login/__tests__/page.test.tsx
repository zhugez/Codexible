import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));


vi.mock("@/app/lib/api", () => ({
  validateToken: vi.fn(),
}));

import { validateToken } from "@/app/lib/api";
import DashboardLoginPage from "../page";

const mockValidateToken = vi.mocked(validateToken);

describe("DashboardLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes admin role to admin dashboard", async () => {
    mockValidateToken.mockResolvedValue({
      valid: true,
      user: {
        email: "admin@codexible.me",
        name: "Admin",
        plan: "Pro",
        status: "active",
      },
      role: "admin",
      session_source: "cliproxy",
    });

    render(<DashboardLoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/codexible_demo_pro_2026/i), {
      target: { value: "sk-admin-token" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enter dashboard/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard/admin?token=sk-admin-token");
    });
  });

  it("routes non-admin role to user dashboard", async () => {
    mockValidateToken.mockResolvedValue({
      valid: true,
      user: {
        email: "user@codexible.me",
        name: "User",
        plan: "Starter",
        status: "active",
      },
      role: "user",
      session_source: "local",
    });

    render(<DashboardLoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/codexible_demo_pro_2026/i), {
      target: { value: "sk-user-token" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enter dashboard/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard?token=sk-user-token");
    });
  });

  it("shows deterministic backend connectivity guidance when request is blocked", async () => {
    mockValidateToken.mockRejectedValue(
      new Error(
        "Cannot reach backend API. Check NEXT_PUBLIC_API_URL, CSP connect-src policy, and backend health.",
      ),
    );

    render(<DashboardLoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/codexible_demo_pro_2026/i), {
      target: { value: "sk-network-error" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enter dashboard/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/cannot reach backend api/i),
      ).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
