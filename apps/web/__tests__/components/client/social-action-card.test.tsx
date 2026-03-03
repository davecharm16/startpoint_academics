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
      insert: jest.fn(() => ({ error: null })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => ({ error: null })),
      })),
    },
  })),
}));

// Mock @startpoint/ui
jest.mock("@startpoint/ui", () => ({
  Card: ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{ className?: string }>) =>
    React.createElement(
      "div",
      { "data-testid": "card", className, ...props },
      children
    ),
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
  Badge: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("span", { "data-testid": "badge", ...props }, children),
  Input: ({
    type,
    id,
    ...props
  }: {
    type?: string;
    id?: string;
    [key: string]: unknown;
  }) =>
    React.createElement("input", { type: type || "text", id, ...props }),
  Label: ({
    children,
    htmlFor,
    ...props
  }: React.PropsWithChildren<{ htmlFor?: string; [key: string]: unknown }>) =>
    React.createElement("label", { htmlFor, ...props }, children),
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
        return ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(
            "span",
            { "data-testid": `icon-${String(name)}`, ...props },
            children
          );
      },
    }
  )
);

import {
  SocialActionCard,
  type SocialActionCardProps,
} from "@/components/client/social-action-card";

const defaultProps: SocialActionCardProps = {
  actionType: "like_page",
  discountAmount: 50,
  instructionText: "Like our Facebook page and take a screenshot",
  socialUrl: "https://facebook.com/startpointacademics",
  claim: null,
  userId: "user-123",
};

describe("SocialActionCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the action label for like_page", () => {
    render(<SocialActionCard {...defaultProps} />);
    expect(screen.getByText("Like Our Page")).toBeInTheDocument();
  });

  it("renders the action label for follow_page", () => {
    render(<SocialActionCard {...defaultProps} actionType="follow_page" />);
    expect(screen.getByText("Follow Us")).toBeInTheDocument();
  });

  it("renders the action label for share_post", () => {
    render(<SocialActionCard {...defaultProps} actionType="share_post" />);
    expect(screen.getByText("Share a Post")).toBeInTheDocument();
  });

  it("renders discount amount", () => {
    render(<SocialActionCard {...defaultProps} />);
    expect(screen.getByText(/₱50 discount/)).toBeInTheDocument();
  });

  it('shows "Claim Reward" button when no claim exists', () => {
    render(<SocialActionCard {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /claim reward/i })
    ).toBeInTheDocument();
  });

  it('shows "Awaiting Verification" badge for pending claims', () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-1",
          status: "pending",
          discount_amount: 50,
          rejection_reason: null,
          verified_at: null,
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    expect(screen.getByText("Awaiting Verification")).toBeInTheDocument();
  });

  it('shows "Verified" badge for verified claims', () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-2",
          status: "verified",
          discount_amount: 50,
          rejection_reason: null,
          verified_at: "2026-03-02T00:00:00Z",
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it('shows "Rejected" badge with reason for rejected claims', () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-3",
          status: "rejected",
          discount_amount: null,
          rejection_reason: "Screenshot does not show the like action",
          verified_at: null,
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(
      screen.getByText("Screenshot does not show the like action")
    ).toBeInTheDocument();
  });

  it('shows "Resubmit" button for rejected claims', () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-3",
          status: "rejected",
          discount_amount: null,
          rejection_reason: "Invalid screenshot",
          verified_at: null,
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    expect(
      screen.getByRole("button", { name: /resubmit/i })
    ).toBeInTheDocument();
  });

  it("renders instruction text", () => {
    render(<SocialActionCard {...defaultProps} />);
    expect(
      screen.getByText("Like our Facebook page and take a screenshot")
    ).toBeInTheDocument();
  });

  it("renders social URL as external link", () => {
    render(<SocialActionCard {...defaultProps} />);
    const link = screen.getByText("Visit our page");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://facebook.com/startpointacademics"
    );
    expect(link.closest("a")).toHaveAttribute("target", "_blank");
  });

  it('shows claim form when "Claim Reward" is clicked', () => {
    render(<SocialActionCard {...defaultProps} />);

    // Form should not be visible initially
    expect(
      screen.queryByLabelText(/social media username/i)
    ).not.toBeInTheDocument();

    // Click "Claim Reward"
    fireEvent.click(screen.getByRole("button", { name: /claim reward/i }));

    // Form should now be visible
    expect(
      screen.getByLabelText(/social media username/i)
    ).toBeInTheDocument();
  });

  it("claim form has username input and file upload", () => {
    render(<SocialActionCard {...defaultProps} />);

    // Open the form
    fireEvent.click(screen.getByRole("button", { name: /claim reward/i }));

    // Username input
    expect(
      screen.getByLabelText(/social media username/i)
    ).toBeInTheDocument();

    // File input (screenshot proof)
    expect(screen.getByLabelText(/screenshot proof/i)).toBeInTheDocument();
  });

  it("shows earned amount for verified claims", () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-2",
          status: "verified",
          discount_amount: 50,
          rejection_reason: null,
          verified_at: "2026-03-02T00:00:00Z",
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    expect(screen.getByText(/Earned ₱50/)).toBeInTheDocument();
  });

  it("shows submission date for pending claims", () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-1",
          status: "pending",
          discount_amount: 50,
          rejection_reason: null,
          verified_at: null,
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    expect(screen.getByText(/Submitted on/)).toBeInTheDocument();
  });

  it("applies amber border for pending claims", () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-1",
          status: "pending",
          discount_amount: 50,
          rejection_reason: null,
          verified_at: null,
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("border-l-amber-400");
  });

  it("applies green border for verified claims", () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-2",
          status: "verified",
          discount_amount: 50,
          rejection_reason: null,
          verified_at: "2026-03-02T00:00:00Z",
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("border-l-green-500");
  });

  it("applies red border for rejected claims", () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-3",
          status: "rejected",
          discount_amount: null,
          rejection_reason: "Invalid",
          verified_at: null,
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("border-l-red-500");
  });

  it('shows claim form when "Resubmit" is clicked for rejected claims', () => {
    render(
      <SocialActionCard
        {...defaultProps}
        claim={{
          id: "claim-3",
          status: "rejected",
          discount_amount: null,
          rejection_reason: "Invalid screenshot",
          verified_at: null,
          created_at: "2026-03-01T00:00:00Z",
        }}
      />
    );

    // Click "Resubmit"
    fireEvent.click(screen.getByRole("button", { name: /resubmit/i }));

    // Form should now be visible
    expect(
      screen.getByLabelText(/social media username/i)
    ).toBeInTheDocument();
  });
});
