import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock @startpoint/supabase/client
jest.mock("@startpoint/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    })),
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
  Badge: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("span", { "data-testid": "badge", ...props }, children),
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

import { ProfileForm } from "@/components/client/profile-form";

const defaultProps = {
  userId: "user-123",
  fullName: "John Doe",
  phone: "+63 912 345 6789",
  referralCode: "JOHN1234",
};

describe("ProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders full name input with initial value", () => {
    render(<ProfileForm {...defaultProps} />);

    const fullNameInput = screen.getByLabelText("Full Name");
    expect(fullNameInput).toBeInTheDocument();
    expect(fullNameInput).toHaveValue("John Doe");
  });

  it("renders phone input with initial value", () => {
    render(<ProfileForm {...defaultProps} />);

    const phoneInput = screen.getByLabelText("Phone");
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveValue("+63 912 345 6789");
  });

  it("renders referral code as read-only badge", () => {
    render(<ProfileForm {...defaultProps} />);

    const badge = screen.getByTestId("badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("JOHN1234");
  });

  it("renders save button", () => {
    render(<ProfileForm {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeInTheDocument();
  });

  it("shows validation error for short name", async () => {
    render(<ProfileForm {...defaultProps} />);

    const fullNameInput = screen.getByLabelText("Full Name");
    fireEvent.change(fullNameInput, { target: { value: "J" } });

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters")
      ).toBeInTheDocument();
    });
  });

  it("referral code is not editable (rendered as Badge, not input)", () => {
    render(<ProfileForm {...defaultProps} />);

    // Referral code should be displayed as a Badge, not an input field
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("JOHN1234");

    // There should be no input for referral code
    const inputs = screen.getAllByRole("textbox");
    const inputValues = inputs.map((input) =>
      (input as HTMLInputElement).value
    );
    expect(inputValues).not.toContain("JOHN1234");
  });

  it("does not render referral code section when referralCode is null", () => {
    render(<ProfileForm {...defaultProps} referralCode={null} />);

    expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
  });
});
