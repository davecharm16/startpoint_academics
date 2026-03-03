/**
 * Tests for the ReferralSettingsForm component
 *
 * Validates:
 * - Renders all form fields (toggle, selects, inputs, button)
 * - Shows default values when no settings provided
 * - Pre-populates with existing settings when provided
 * - Validates discount value does not exceed 50% (for percentage type)
 * - Validates minimum payout is at least 100
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/admin/settings",
}));

// Mock @startpoint/supabase/client
jest.mock("@startpoint/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
      insert: jest.fn(() => ({ error: null })),
    })),
  })),
}));

// Mock @startpoint/ui - render real HTML elements with forwardRef for Input
jest.mock("@startpoint/ui", () => ({
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("button", props, children),
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
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    [key: string]: unknown;
  }) =>
    React.createElement("button", {
      role: "switch",
      "aria-checked": checked,
      onClick: () => onCheckedChange?.(!checked),
      ...props,
    }),
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
      children
    ),
  SelectTrigger: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement(
      "button",
      { "data-testid": "select-trigger", ...props },
      children
    ),
  SelectContent: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  SelectItem: ({
    children,
    value,
    ...props
  }: React.PropsWithChildren<
    { value: string } & Record<string, unknown>
  >) => React.createElement("option", { value, ...props }, children),
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
jest.mock("lucide-react", () => ({
  Loader2: () =>
    React.createElement("span", { "data-testid": "loader-icon" }),
  Check: () => React.createElement("span", { "data-testid": "check-icon" }),
  AlertCircle: () =>
    React.createElement("span", { "data-testid": "alert-icon" }),
}));

// Import the component after mocks
import { ReferralSettingsForm } from "@/components/admin/referral-settings-form";

const existingSettings = {
  id: "ref-settings-1",
  program_enabled: false,
  new_client_discount_type: "fixed" as const,
  new_client_discount_value: 200,
  referrer_reward_type: "percentage" as const,
  referrer_reward_value: 5,
  minimum_payout: 1000,
  updated_at: "2026-03-01T00:00:00Z",
};

describe("ReferralSettingsForm", () => {
  it("renders program enabled toggle", () => {
    render(<ReferralSettingsForm settings={null} />);

    expect(
      screen.getByText("Enable Referral Program")
    ).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders discount type select", () => {
    render(<ReferralSettingsForm settings={null} />);

    expect(
      screen.getByText("New Client Discount Type")
    ).toBeInTheDocument();
    expect(screen.getByText("Percentage of Total")).toBeInTheDocument();
    expect(screen.getByText("Fixed Amount")).toBeInTheDocument();
  });

  it("renders discount value input", () => {
    render(<ReferralSettingsForm settings={null} />);

    const input = screen.getByRole("spinbutton", {
      name: /discount percentage/i,
    });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders reward type select", () => {
    render(<ReferralSettingsForm settings={null} />);

    expect(screen.getByText("Referrer Reward Type")).toBeInTheDocument();
    expect(screen.getByText("Fixed Amount (₱)")).toBeInTheDocument();
    expect(screen.getByText("Percentage of Order")).toBeInTheDocument();
  });

  it("renders reward value input", () => {
    render(<ReferralSettingsForm settings={null} />);

    const input = screen.getByRole("spinbutton", {
      name: /reward amount/i,
    });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders minimum payout input", () => {
    render(<ReferralSettingsForm settings={null} />);

    const input = screen.getByRole("spinbutton", {
      name: /minimum payout amount/i,
    });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders save button", () => {
    render(<ReferralSettingsForm settings={null} />);

    expect(
      screen.getByRole("button", { name: /save referral settings/i })
    ).toBeInTheDocument();
  });

  it("shows default values when no settings provided", () => {
    render(<ReferralSettingsForm settings={null} />);

    // Program enabled defaults to true
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");

    // Discount value defaults to 10
    const discountInput = screen.getByRole("spinbutton", {
      name: /discount percentage/i,
    });
    expect(discountInput).toHaveValue(10);

    // Reward value defaults to 100
    const rewardInput = screen.getByRole("spinbutton", {
      name: /reward amount/i,
    });
    expect(rewardInput).toHaveValue(100);

    // Minimum payout defaults to 500
    const payoutInput = screen.getByRole("spinbutton", {
      name: /minimum payout amount/i,
    });
    expect(payoutInput).toHaveValue(500);
  });

  it("pre-populates with existing settings when provided", () => {
    render(<ReferralSettingsForm settings={existingSettings} />);

    // Program enabled is false
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");

    // Discount value is 200
    const discountInput = screen.getByDisplayValue("200");
    expect(discountInput).toBeInTheDocument();

    // Reward value is 5
    const rewardInput = screen.getByDisplayValue("5");
    expect(rewardInput).toBeInTheDocument();

    // Minimum payout is 1000
    const payoutInput = screen.getByDisplayValue("1000");
    expect(payoutInput).toBeInTheDocument();
  });

  it("validates discount value does not exceed 50% for percentage type", async () => {
    render(<ReferralSettingsForm settings={null} />);

    // Default type is "percentage". Set discount value to 60 (exceeds 50%)
    const discountInput = screen.getByRole("spinbutton", {
      name: /discount percentage/i,
    });
    fireEvent.input(discountInput, { target: { value: "60" } });

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /save referral settings/i,
    });
    fireEvent.click(submitButton);

    // Wait for validation error to appear
    await waitFor(() => {
      expect(
        screen.getByText("Discount cannot exceed 50%")
      ).toBeInTheDocument();
    });
  });

  it("validates minimum payout is at least 100", async () => {
    render(<ReferralSettingsForm settings={null} />);

    // Set minimum payout to 50 (below 100)
    const payoutInput = screen.getByRole("spinbutton", {
      name: /minimum payout amount/i,
    });
    fireEvent.input(payoutInput, { target: { value: "50" } });

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /save referral settings/i,
    });
    fireEvent.click(submitButton);

    // Wait for validation error to appear
    await waitFor(() => {
      expect(
        screen.getByText("Minimum payout must be at least ₱100")
      ).toBeInTheDocument();
    });
  });
});
