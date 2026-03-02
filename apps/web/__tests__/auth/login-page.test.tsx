/**
 * Tests for the login page component
 *
 * Validates:
 * - "Forgot Password?" link is present and links to /auth/forgot-password
 * - "Sign up" link is present and links to /auth/register
 * - ?reset=true shows password reset success message
 * - ?registered=true shows registration success message
 * - Form fields are present (email, password, submit button)
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
let mockSearchParamsValues: Record<string, string> = {};
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsValues[key] ?? null,
  }),
}));

// Mock @startpoint/supabase/client
jest.mock("@startpoint/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
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
  LogIn: () => React.createElement("span", { "data-testid": "login-icon" }),
  AlertCircle: () => React.createElement("span", { "data-testid": "alert-icon" }),
  CheckCircle2: () => React.createElement("span", { "data-testid": "check-icon" }),
}));

// Import the component after mocks
import LoginPage from "@/app/auth/login/page";

describe("Login Page", () => {
  beforeEach(() => {
    mockSearchParamsValues = {};
  });

  it("should render email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("should render Sign In button", () => {
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should render Sign up link to /auth/register", () => {
    render(<LoginPage />);

    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/auth/register");
  });

  it("should render Forgot Password link to /auth/forgot-password", () => {
    render(<LoginPage />);

    const forgotLink = screen.getByRole("link", { name: /forgot password/i });
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute("href", "/auth/forgot-password");
  });

  it("should show registration success message when ?registered=true", () => {
    mockSearchParamsValues = { registered: "true" };
    render(<LoginPage />);

    expect(
      screen.getByText(/account created successfully/i)
    ).toBeInTheDocument();
  });

  it("should show password reset success message when ?reset=true", () => {
    mockSearchParamsValues = { reset: "true" };
    render(<LoginPage />);

    expect(
      screen.getByText(/password.*reset successfully|password has been updated/i)
    ).toBeInTheDocument();
  });
});
