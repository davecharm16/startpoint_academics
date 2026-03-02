import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: mockRefresh,
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
  Card: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", { "data-testid": "card", ...props }, children),
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
    ...props
  }: React.PropsWithChildren<{
    disabled?: boolean;
    onClick?: () => void;
    [key: string]: unknown;
  }>) =>
    React.createElement(
      "button",
      { disabled, onClick, ...props },
      children
    ),
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

// Mock the PayoutRequestForm so we can test RewardRedemption in isolation
jest.mock("@/components/client/payout-request-form", () => ({
  PayoutRequestForm: ({
    onCancel,
  }: {
    onCancel: () => void;
    [key: string]: unknown;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "payout-form" },
      React.createElement(
        "button",
        { onClick: onCancel },
        "Cancel Payout"
      )
    ),
}));

// Mock lucide-react icons (in case they're imported)
jest.mock("lucide-react", () => new Proxy({}, {
  get: (_target, name) => {
    if (name === "__esModule") return true;
    return () => React.createElement("span", { "data-testid": `icon-${String(name)}` });
  },
}));

import {
  RewardRedemption,
  type RewardRedemptionProps,
} from "@/components/client/reward-redemption";

const defaultProps: RewardRedemptionProps = {
  rewardBalance: 1000,
  minimumPayout: 500,
  applyToNextOrder: false,
  hasPendingPayout: false,
  userId: "user-123",
};

describe("RewardRedemption", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the reward balance amount", () => {
    render(<RewardRedemption {...defaultProps} />);

    // ₱1,000 formatted
    expect(screen.getByText(/₱1,000/)).toBeInTheDocument();
  });

  it("renders the Reward Balance title", () => {
    render(<RewardRedemption {...defaultProps} />);

    expect(screen.getByText("Reward Balance")).toBeInTheDocument();
  });

  it("renders Apply to Next Order button", () => {
    render(<RewardRedemption {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /apply to next order/i })
    ).toBeInTheDocument();
  });

  it("renders Request Cash Payout button", () => {
    render(<RewardRedemption {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /request cash payout/i })
    ).toBeInTheDocument();
  });

  it("shows check mark when applyToNextOrder is true", () => {
    render(<RewardRedemption {...defaultProps} applyToNextOrder={true} />);

    expect(
      screen.getByRole("button", { name: /applied to next order/i })
    ).toBeInTheDocument();
  });

  it("disables Apply to Next Order when balance is zero", () => {
    render(<RewardRedemption {...defaultProps} rewardBalance={0} />);

    const button = screen.getByRole("button", {
      name: /apply to next order/i,
    });
    expect(button).toBeDisabled();
  });

  it("disables payout button when balance below minimum", () => {
    render(
      <RewardRedemption
        {...defaultProps}
        rewardBalance={200}
        minimumPayout={500}
      />
    );

    const button = screen.getByRole("button", {
      name: /request cash payout/i,
    });
    expect(button).toBeDisabled();
  });

  it("enables payout button when balance meets minimum", () => {
    render(
      <RewardRedemption
        {...defaultProps}
        rewardBalance={500}
        minimumPayout={500}
      />
    );

    const button = screen.getByRole("button", {
      name: /request cash payout/i,
    });
    expect(button).not.toBeDisabled();
  });

  it("shows pending payout alert when hasPendingPayout is true", () => {
    render(<RewardRedemption {...defaultProps} hasPendingPayout={true} />);

    expect(
      screen.getByText(
        "You have a pending payout request. Your balance is on hold."
      )
    ).toBeInTheDocument();
  });

  it("disables both buttons when payout is pending", () => {
    render(<RewardRedemption {...defaultProps} hasPendingPayout={true} />);

    const applyButton = screen.getByRole("button", {
      name: /apply to next order/i,
    });
    const payoutButton = screen.getByRole("button", {
      name: /request cash payout/i,
    });

    expect(applyButton).toBeDisabled();
    expect(payoutButton).toBeDisabled();
  });

  it("shows minimum payout requirement text when balance below minimum", () => {
    render(
      <RewardRedemption
        {...defaultProps}
        rewardBalance={200}
        minimumPayout={500}
      />
    );

    expect(
      screen.getByText(/minimum ₱500 required for cash payout/i)
    ).toBeInTheDocument();
  });

  it("does not show minimum payout text when balance is zero", () => {
    render(
      <RewardRedemption
        {...defaultProps}
        rewardBalance={0}
        minimumPayout={500}
      />
    );

    expect(
      screen.queryByText(/minimum.*required for cash payout/i)
    ).not.toBeInTheDocument();
  });

  it("does not show minimum payout text when pending payout exists", () => {
    render(
      <RewardRedemption
        {...defaultProps}
        rewardBalance={200}
        minimumPayout={500}
        hasPendingPayout={true}
      />
    );

    expect(
      screen.queryByText(/minimum.*required for cash payout/i)
    ).not.toBeInTheDocument();
  });

  it("shows payout form when Request Cash Payout is clicked", () => {
    render(<RewardRedemption {...defaultProps} />);

    expect(screen.queryByTestId("payout-form")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /request cash payout/i })
    );

    expect(screen.getByTestId("payout-form")).toBeInTheDocument();
  });
});
