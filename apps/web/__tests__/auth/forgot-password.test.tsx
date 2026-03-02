/**
 * Tests for the forgot password page component
 *
 * Validates:
 * - Email input field is present
 * - Submit button is present
 * - Shows generic success message after submission (no email enumeration)
 * - Has "Back to Login" link
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

// Mock Supabase client
const mockResetPasswordForEmail = jest.fn();
jest.mock("@startpoint/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

// Mock @startpoint/ui - render real HTML elements
jest.mock("@startpoint/ui", () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("button", props, children),
  Input: (props: Record<string, unknown>) =>
    React.createElement("input", props),
  Label: ({ children, htmlFor, ...props }: React.PropsWithChildren<{ htmlFor?: string } & Record<string, unknown>>) =>
    React.createElement("label", { htmlFor, ...props }, children),
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  CardContent: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  CardDescription: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("p", props, children),
  CardHeader: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  CardTitle: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("h2", props, children),
  CardFooter: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  Alert: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", { role: "alert", ...props }, children),
  AlertDescription: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("p", props, children),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Loader2: () => React.createElement("span", { "data-testid": "loader-icon" }),
  Mail: () => React.createElement("span", { "data-testid": "mail-icon" }),
  ArrowLeft: () => React.createElement("span", { "data-testid": "arrow-icon" }),
  CheckCircle2: () => React.createElement("span", { "data-testid": "check-icon" }),
  AlertCircle: () => React.createElement("span", { "data-testid": "alert-icon" }),
}));

// Import after mocks
import ForgotPasswordPage from "@/app/auth/forgot-password/page";

describe("Forgot Password Page", () => {
  beforeEach(() => {
    mockResetPasswordForEmail.mockReset();
  });

  it("should render email input field", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(<ForgotPasswordPage />);

    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("should render Back to Login link", () => {
    render(<ForgotPasswordPage />);

    const backLink = screen.getByRole("link", { name: /back to login/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/auth/login");
  });

  it("should show generic success message after submission regardless of email existence", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/if an account exists.*you.*receive/i)
      ).toBeInTheDocument();
    });
  });

  it("should call resetPasswordForEmail with correct email", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining("/auth/callback"),
        })
      );
    });
  });
});
