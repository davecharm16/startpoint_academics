import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock @startpoint/supabase/client
jest.mock("@startpoint/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { email: "test@example.com" } },
      })),
      signInWithPassword: jest.fn(() => ({ error: null })),
      updateUser: jest.fn(() => ({ error: null })),
    },
  })),
}));

// Mock @startpoint/ui
jest.mock("@startpoint/ui", () => ({
  Button: ({
    children,
    disabled,
    type,
    ...props
  }: React.PropsWithChildren<{
    disabled?: boolean;
    type?: string;
    [key: string]: unknown;
  }>) =>
    React.createElement("button", { disabled, type, ...props }, children),
  Input: React.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<HTMLInputElement>) =>
      React.createElement("input", { ...props, ref })
  ),
  Label: ({
    children,
    htmlFor,
    ...props
  }: React.PropsWithChildren<
    { htmlFor?: string } & Record<string, unknown>
  >) => React.createElement("label", { htmlFor, ...props }, children),
  Alert: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", { role: "alert", ...props }, children),
  AlertDescription: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("p", props, children),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () =>
  new Proxy(
    {},
    {
      get: (_target, name) => {
        if (name === "__esModule") return true;
        return () =>
          React.createElement("span", {
            "data-testid": `icon-${String(name)}`,
          });
      },
    }
  )
);

import { PasswordChangeForm } from "@/components/client/password-change-form";

describe("PasswordChangeForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders current password field", () => {
    render(<PasswordChangeForm />);

    const currentPasswordInput = screen.getByLabelText("Current Password");
    expect(currentPasswordInput).toBeInTheDocument();
    expect(currentPasswordInput).toHaveAttribute("type", "password");
  });

  it("renders new password field", () => {
    render(<PasswordChangeForm />);

    const newPasswordInput = screen.getByLabelText("New Password");
    expect(newPasswordInput).toBeInTheDocument();
    expect(newPasswordInput).toHaveAttribute("type", "password");
  });

  it("renders confirm password field", () => {
    render(<PasswordChangeForm />);

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("renders change password button", () => {
    render(<PasswordChangeForm />);

    const changeButton = screen.getByRole("button", {
      name: /change password/i,
    });
    expect(changeButton).toBeInTheDocument();
  });

  it("shows password strength indicator when typing", () => {
    render(<PasswordChangeForm />);

    // Indicator should not be visible initially
    expect(
      screen.queryByTestId("password-strength-indicator")
    ).not.toBeInTheDocument();

    // Type in new password field
    const newPasswordInput = screen.getByLabelText("New Password");
    fireEvent.change(newPasswordInput, { target: { value: "Test1234" } });

    // Indicator should now be visible
    expect(
      screen.getByTestId("password-strength-indicator")
    ).toBeInTheDocument();
  });

  it("shows error when passwords don't match", () => {
    render(<PasswordChangeForm />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    fireEvent.change(newPasswordInput, { target: { value: "Test1234" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Different1234" },
    });

    expect(
      screen.getByText("Passwords do not match")
    ).toBeInTheDocument();
  });

  it("does not show mismatch error when passwords match", () => {
    render(<PasswordChangeForm />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    fireEvent.change(newPasswordInput, { target: { value: "Test1234" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Test1234" },
    });

    expect(
      screen.queryByText("Passwords do not match")
    ).not.toBeInTheDocument();
  });

  it("disables submit button when required fields are empty", () => {
    render(<PasswordChangeForm />);

    const changeButton = screen.getByRole("button", {
      name: /change password/i,
    });
    expect(changeButton).toBeDisabled();
  });
});
