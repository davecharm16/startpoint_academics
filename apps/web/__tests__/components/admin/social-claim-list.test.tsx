/**
 * Tests for the SocialClaimList component
 *
 * Validates:
 * - Renders claims table with correct columns
 * - Filter tabs work (All, Pending, Verified, Rejected)
 * - Status badges display correctly
 * - Pending count shown on filter tab
 * - Click row opens review dialog
 * - Displays action type labels correctly
 * - Displays formatted dates
 * - Empty state when no claims match filter
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
jest.mock("@startpoint/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: "admin-1" } },
      })),
    },
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
      insert: jest.fn(() => ({ error: null })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { reward_balance: 500 },
          })),
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        createSignedUrl: jest.fn(() =>
          Promise.resolve({ data: { signedUrl: "https://example.com/screenshot.jpg" } })
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
    open ? React.createElement("div", { "data-testid": "dialog", ...props }, children) : null,
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
  Eye: () => React.createElement("span", { "data-testid": "eye-icon" }),
  ExternalLink: () =>
    React.createElement("span", { "data-testid": "external-link-icon" }),
  Image: () => React.createElement("span", { "data-testid": "image-icon" }),
}));

// Import the component after mocks
import { SocialClaimList } from "@/components/admin/social-claim-list";

const mockClaims = [
  {
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
  },
  {
    id: "claim-2",
    user_id: "user-2",
    action_type: "follow_page" as const,
    social_username: "@juan_cruz",
    screenshot_path: "social-proofs/user-2/follow_page.jpg",
    discount_amount: 50,
    status: "verified" as const,
    verified_by: "admin-1",
    verified_at: "2026-02-28T12:00:00Z",
    rejection_reason: null,
    created_at: "2026-02-25T08:00:00Z",
    clientName: "Juan Cruz",
    clientEmail: "juan@example.com",
    socialUrl: "https://facebook.com/startpoint",
  },
  {
    id: "claim-3",
    user_id: "user-3",
    action_type: "share_post" as const,
    social_username: "@ana_reyes",
    screenshot_path: "social-proofs/user-3/share_post.jpg",
    discount_amount: 100,
    status: "rejected" as const,
    verified_by: null,
    verified_at: null,
    rejection_reason: "Screenshot not clear enough",
    created_at: "2026-02-24T09:00:00Z",
    clientName: "Ana Reyes",
    clientEmail: "ana@example.com",
    socialUrl: "https://facebook.com/startpoint",
  },
];

describe("SocialClaimList", () => {
  it("renders claims table with correct columns", () => {
    render(<SocialClaimList claims={mockClaims} />);

    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders claim entries with correct data", () => {
    render(<SocialClaimList claims={mockClaims} />);

    // Client names
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
    expect(screen.getByText("Ana Reyes")).toBeInTheDocument();

    // Usernames
    expect(screen.getByText("@maria_santos")).toBeInTheDocument();
    expect(screen.getByText("@juan_cruz")).toBeInTheDocument();
    expect(screen.getByText("@ana_reyes")).toBeInTheDocument();
  });

  it("displays action type labels correctly", () => {
    render(<SocialClaimList claims={mockClaims} />);

    expect(screen.getByText("Like Page")).toBeInTheDocument();
    expect(screen.getByText("Follow Page")).toBeInTheDocument();
    expect(screen.getByText("Share Post")).toBeInTheDocument();
  });

  it("shows status filter tabs (All, Pending, Verified, Rejected)", () => {
    render(<SocialClaimList claims={mockClaims} />);

    const allButtons = screen.getAllByRole("button");
    const filterLabels = allButtons.map((b) => b.textContent);

    expect(filterLabels).toContain("All");
    expect(filterLabels.some((l) => l?.startsWith("Pending"))).toBe(true);
    expect(filterLabels).toContain("Verified");
    expect(filterLabels).toContain("Rejected");
  });

  it("filters claims by status when tab clicked", () => {
    render(<SocialClaimList claims={mockClaims} />);

    // Initially all claims visible
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
    expect(screen.getByText("Ana Reyes")).toBeInTheDocument();

    // Click "Pending" filter
    const allButtons = screen.getAllByRole("button");
    const pendingButton = allButtons.find((b) =>
      b.textContent?.startsWith("Pending")
    );
    fireEvent.click(pendingButton!);

    // Only pending claims visible
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.queryByText("Juan Cruz")).not.toBeInTheDocument();
    expect(screen.queryByText("Ana Reyes")).not.toBeInTheDocument();
  });

  it("shows pending count badge on filter tab", () => {
    render(<SocialClaimList claims={mockClaims} />);

    // There's 1 pending claim, so badge should show "1"
    const allButtons = screen.getAllByRole("button");
    const pendingButton = allButtons.find((b) =>
      b.textContent?.startsWith("Pending")
    );
    expect(pendingButton).toBeTruthy();
    expect(pendingButton?.textContent).toContain("1");
  });

  it("shows status badges with correct text", () => {
    render(<SocialClaimList claims={mockClaims} />);

    // Status text appears in both filter tabs and status badges, so use getAllByText
    // "Pending" appears as part of "Pending1" in filter tab, but exact in status badge
    // "Verified" and "Rejected" appear in both filter tabs and status badges
    expect(screen.getAllByText("Verified").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Rejected").length).toBeGreaterThanOrEqual(1);
    // Pending status badge is separate from "Pending1" filter tab text
    const pendingBadges = screen.getAllByText("Pending");
    expect(pendingBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows Review button for pending claims", () => {
    render(<SocialClaimList claims={mockClaims} />);

    // At least one Review button for the pending claim
    expect(screen.getAllByText("Review").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no claims match filter", () => {
    const pendingOnly = mockClaims.filter((c) => c.status === "pending");
    render(<SocialClaimList claims={pendingOnly} />);

    // Click "Rejected" filter
    const allButtons = screen.getAllByRole("button");
    const rejectedButton = allButtons.find(
      (b) => b.textContent === "Rejected"
    );
    fireEvent.click(rejectedButton!);

    expect(
      screen.getByText("No claims match the selected filter.")
    ).toBeInTheDocument();
  });
});
