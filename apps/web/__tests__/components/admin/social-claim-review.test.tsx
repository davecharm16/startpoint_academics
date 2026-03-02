/**
 * Tests for the SocialClaimReview component
 *
 * Validates:
 * - Renders claim details (action type, username, social URL link)
 * - Shows verify and reject buttons for pending claims
 * - Reject opens reason textarea
 * - Reject button disabled when reason is empty
 * - Hides action buttons for non-pending claims
 * - Shows discount amount
 * - Social URL link is clickable with target _blank
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/admin/social-claims",
}));

// Mock @startpoint/supabase/client
const mockUpdate = jest.fn(() => ({
  eq: jest.fn(() => Promise.resolve({ error: null })),
}));
const mockInsert = jest.fn(() => Promise.resolve({ error: null }));
const mockSelect = jest.fn(() => ({
  eq: jest.fn(() => ({
    single: jest.fn(() =>
      Promise.resolve({
        data: { reward_balance: 500 },
      })
    ),
  })),
}));

jest.mock("@startpoint/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "admin-1" } },
        })
      ),
    },
    from: jest.fn(() => ({
      update: mockUpdate,
      insert: mockInsert,
      select: mockSelect,
    })),
    storage: {
      from: jest.fn(() => ({
        createSignedUrl: jest.fn(() =>
          Promise.resolve({
            data: { signedUrl: "https://example.com/screenshot.jpg" },
          })
        ),
      })),
    },
  })),
}));

// Mock @startpoint/ui
jest.mock("@startpoint/ui", () => ({
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("button", props, children),
  Badge: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("span", props, children),
  Dialog: ({
    children,
    open,
    ...props
  }: React.PropsWithChildren<{ open?: boolean } & Record<string, unknown>>) =>
    React.createElement("div", { "data-testid": "dialog", ...props }, children),
  DialogContent: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  DialogHeader: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", props, children),
  DialogTitle: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("h2", props, children),
  DialogDescription: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("p", props, children),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Check: () => React.createElement("span", { "data-testid": "check-icon" }),
  X: () => React.createElement("span", { "data-testid": "x-icon" }),
  Loader2: () =>
    React.createElement("span", { "data-testid": "loader-icon" }),
  ExternalLink: () =>
    React.createElement("span", { "data-testid": "external-link-icon" }),
  Image: () => React.createElement("span", { "data-testid": "image-icon" }),
}));

// Import the component after mocks
import { SocialClaimReview } from "@/components/admin/social-claim-review";

const pendingClaim = {
  id: "claim-1",
  user_id: "user-1",
  action_type: "like_page" as const,
  social_username: "@maria_santos",
  screenshot_path: "social-proofs/user-1/like_page.jpg",
  discount_amount: 50,
  status: "pending" as const,
  verified_by: null,
  verified_at: null,
  rejection_reason: null,
  created_at: "2026-03-01T10:00:00Z",
  clientName: "Maria Santos",
  clientEmail: "maria@example.com",
  socialUrl: "https://facebook.com/startpoint",
};

const verifiedClaim = {
  ...pendingClaim,
  id: "claim-2",
  status: "verified" as const,
  verified_by: "admin-1",
  verified_at: "2026-02-28T12:00:00Z",
};

describe("SocialClaimReview", () => {
  it("renders claim details (action type, username)", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("Like Page")).toBeInTheDocument();
    expect(screen.getByText("@maria_santos")).toBeInTheDocument();
  });

  it("shows social URL link", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    const link = screen.getByRole("link", { name: /verify on platform/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://facebook.com/startpoint");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows discount amount", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText(/₱50/)).toBeInTheDocument();
  });

  it("shows verify and reject buttons for pending claims", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("Verify")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("hides action buttons for non-pending claims", () => {
    render(
      <SocialClaimReview
        claim={verifiedClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.queryByText("Verify")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  it("reject opens reason textarea", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Click Reject button
    fireEvent.click(screen.getByText("Reject"));

    // Textarea should appear
    expect(
      screen.getByPlaceholderText("Enter rejection reason...")
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm Rejection")).toBeInTheDocument();
  });

  it("reject confirm button disabled when reason is empty", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Click Reject button
    fireEvent.click(screen.getByText("Reject"));

    // Confirm button should be disabled with empty reason
    const confirmButton = screen.getByText("Confirm Rejection");
    expect(confirmButton).toBeDisabled();
  });

  it("reject confirm button enabled when reason is provided", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Click Reject button
    fireEvent.click(screen.getByText("Reject"));

    // Type a reason
    fireEvent.change(
      screen.getByPlaceholderText("Enter rejection reason..."),
      { target: { value: "Screenshot is not valid" } }
    );

    // Confirm button should now be enabled
    const confirmButton = screen.getByText("Confirm Rejection");
    expect(confirmButton).not.toBeDisabled();
  });

  it("shows client name", () => {
    render(
      <SocialClaimReview
        claim={pendingClaim}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });
});
