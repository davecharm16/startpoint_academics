import React from "react";
import { render, screen } from "@testing-library/react";

// Mock @startpoint/supabase/client
jest.mock("@startpoint/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
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

import { EmailChangeForm } from "@/components/client/email-change-form";

describe("EmailChangeForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders new email input", () => {
    render(<EmailChangeForm />);

    const emailInput = screen.getByLabelText("New Email Address");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("renders submit button", () => {
    render(<EmailChangeForm />);

    const submitButton = screen.getByRole("button", {
      name: /update email/i,
    });
    expect(submitButton).toBeInTheDocument();
  });

  it("button text indicates email update", () => {
    render(<EmailChangeForm />);

    const submitButton = screen.getByRole("button", {
      name: /update email/i,
    });
    expect(submitButton).toHaveTextContent("Update Email");
  });

  it("submit button is disabled when email is empty", () => {
    render(<EmailChangeForm />);

    const submitButton = screen.getByRole("button", {
      name: /update email/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("renders email input with placeholder", () => {
    render(<EmailChangeForm />);

    const emailInput = screen.getByPlaceholderText("newemail@example.com");
    expect(emailInput).toBeInTheDocument();
  });
});
