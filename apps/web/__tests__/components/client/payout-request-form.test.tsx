import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

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
      insert: jest.fn(() => ({ error: null })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { reward_balance: 1000 },
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    })),
  })),
}));

// Mock @startpoint/ui
jest.mock("@startpoint/ui", () => ({
  Card: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  CardHeader: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  CardContent: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  CardTitle: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("h3", props, children),
  Button: ({
    children,
    disabled,
    onClick,
    type,
    ...props
  }: React.PropsWithChildren<{
    disabled?: boolean;
    onClick?: () => void;
    type?: string;
    [key: string]: unknown;
  }>) =>
    React.createElement(
      "button",
      { disabled, onClick, type, ...props },
      children
    ),
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
  Select: ({
    children,
    value,
    onValueChange,
  }: React.PropsWithChildren<{
    value?: string;
    onValueChange?: (value: string) => void;
  }>) =>
    React.createElement(
      "div",
      { "data-testid": "select-root", "data-value": value },
      React.createElement(
        "select",
        {
          "data-testid": "payment-method-select",
          value: value || "",
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
            onValueChange?.(e.target.value),
        },
        React.createElement("option", { value: "" }, "Select payment method"),
        React.createElement("option", { value: "gcash" }, "GCash"),
        React.createElement("option", { value: "bank_transfer" }, "Bank Transfer")
      ),
      children
    ),
  SelectTrigger: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  SelectContent: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  SelectItem: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  SelectValue: ({
    placeholder,
    ...props
  }: { placeholder?: string } & Record<string, unknown>) =>
    React.createElement("span", props, placeholder),
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
jest.mock("lucide-react", () => new Proxy({}, {
  get: (_target, name) => {
    if (name === "__esModule") return true;
    return () => React.createElement("span", { "data-testid": `icon-${String(name)}` });
  },
}));

import {
  PayoutRequestForm,
  type PayoutRequestFormProps,
} from "@/components/client/payout-request-form";

const defaultProps: PayoutRequestFormProps = {
  maxAmount: 1000,
  minimumPayout: 500,
  userId: "user-123",
  onSuccess: jest.fn(),
  onCancel: jest.fn(),
};

describe("PayoutRequestForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Request Cash Payout title", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(screen.getByText("Request Cash Payout")).toBeInTheDocument();
  });

  it("renders payment method select", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(screen.getByText("Payment Method")).toBeInTheDocument();
    expect(screen.getByTestId("payment-method-select")).toBeInTheDocument();
  });

  it("renders account number field", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(screen.getByText("Account Number")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter account number")
    ).toBeInTheDocument();
  });

  it("renders account name field", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(screen.getByText("Account Name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter account name")
    ).toBeInTheDocument();
  });

  it("renders amount input", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(screen.getByText("Amount")).toBeInTheDocument();
    const amountInput = screen.getByDisplayValue("1000");
    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveAttribute("type", "number");
  });

  it("displays min and max amount text", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(screen.getByText(/Min:.*₱500/)).toBeInTheDocument();
    expect(screen.getByText(/Max:.*₱1,000/)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /submit payout request/i })
    ).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it("submit button is disabled when form is incomplete", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    // Payment method is not selected, so form is incomplete
    const submitButton = screen.getByRole("button", {
      name: /submit payout request/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<PayoutRequestForm {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it("enables submit button when all fields are filled", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    // Fill in the form fields
    const paymentSelect = screen.getByTestId("payment-method-select");
    fireEvent.change(paymentSelect, { target: { value: "gcash" } });

    const accountNumber = screen.getByPlaceholderText("Enter account number");
    fireEvent.change(accountNumber, { target: { value: "09171234567" } });

    const accountName = screen.getByPlaceholderText("Enter account name");
    fireEvent.change(accountName, { target: { value: "Juan Cruz" } });

    const submitButton = screen.getByRole("button", {
      name: /submit payout request/i,
    });
    expect(submitButton).not.toBeDisabled();
  });

  it("submit button disabled when amount below minimum", () => {
    render(<PayoutRequestForm {...defaultProps} />);

    // Fill all fields
    const paymentSelect = screen.getByTestId("payment-method-select");
    fireEvent.change(paymentSelect, { target: { value: "gcash" } });

    const accountNumber = screen.getByPlaceholderText("Enter account number");
    fireEvent.change(accountNumber, { target: { value: "09171234567" } });

    const accountName = screen.getByPlaceholderText("Enter account name");
    fireEvent.change(accountName, { target: { value: "Juan Cruz" } });

    // Set amount below minimum
    const amountInput = screen.getByDisplayValue("1000");
    fireEvent.change(amountInput, { target: { value: "100" } });

    const submitButton = screen.getByRole("button", {
      name: /submit payout request/i,
    });
    expect(submitButton).toBeDisabled();
  });
});
