/**
 * Tests for the PayoutList component
 *
 * Validates:
 * - Renders payout table with headers
 * - Renders payout entries with correct data
 * - Shows status filter tabs (All, Pending, Paid, Rejected)
 * - Filters payouts by status when tab clicked
 * - Shows "Mark as Paid" button for pending payouts
 * - Shows "Reject" button for pending payouts
 * - Hides action buttons for non-pending payouts
 * - Shows pending payout count badge
 * - Formats currency amounts correctly
 * - Empty state when no payouts match filter
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/admin/referrals/payouts",
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
  Check: () => React.createElement("span", { "data-testid": "check-icon" }),
  X: () => React.createElement("span", { "data-testid": "x-icon" }),
  Loader2: () =>
    React.createElement("span", { "data-testid": "loader-icon" }),
  Filter: () =>
    React.createElement("span", { "data-testid": "filter-icon" }),
}));

// Import the component after mocks
import { PayoutList } from "@/components/admin/payout-list";

const mockPayouts = [
  {
    id: "payout-1",
    user_id: "user-1",
    amount: 1500,
    payment_method: "gcash" as const,
    payment_details: {
      account_number: "09171234567",
      account_name: "M. Santos GCash",
    },
    status: "pending" as const,
    rejection_reason: null,
    processed_at: null,
    created_at: "2026-03-01T10:00:00Z",
    clientName: "Maria Santos",
    clientEmail: "maria@example.com",
  },
  {
    id: "payout-2",
    user_id: "user-2",
    amount: 2500,
    payment_method: "bank" as const,
    payment_details: {
      account_number: "1234567890",
      account_name: "J. Cruz BDO",
    },
    status: "paid" as const,
    rejection_reason: null,
    processed_at: "2026-02-28T12:00:00Z",
    created_at: "2026-02-25T08:00:00Z",
    clientName: "Juan Cruz",
    clientEmail: "juan@example.com",
  },
  {
    id: "payout-3",
    user_id: "user-3",
    amount: 500,
    payment_method: "gcash" as const,
    payment_details: {
      account_number: "09189876543",
      account_name: "A. Reyes GCash",
    },
    status: "rejected" as const,
    rejection_reason: "Invalid account details",
    processed_at: "2026-02-27T14:00:00Z",
    created_at: "2026-02-24T09:00:00Z",
    clientName: "Ana Reyes",
    clientEmail: "ana@example.com",
  },
];

describe("PayoutList", () => {
  it("renders payout table with headers", () => {
    render(<PayoutList payouts={mockPayouts} />);

    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders payout entries with correct data", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // Client names
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
    expect(screen.getByText("Ana Reyes")).toBeInTheDocument();

    // Client emails
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();

    // Payment methods - GCash appears in two rows
    expect(screen.getAllByText("GCash").length).toBe(2);
    expect(screen.getByText("Bank Transfer")).toBeInTheDocument();

    // Account numbers
    expect(screen.getByText("09171234567")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  it("shows status filter tabs (All, Pending, Paid, Rejected)", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // Filter buttons
    const allButtons = screen.getAllByRole("button");
    const filterLabels = allButtons.map((b) => b.textContent);

    expect(filterLabels).toContain("All");
    // "Pending" tab includes badge count, so check with contains
    expect(filterLabels.some((l) => l?.startsWith("Pending"))).toBe(true);
  });

  it("filters payouts by status when tab clicked", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // Initially all payouts visible
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
    expect(screen.getByText("Ana Reyes")).toBeInTheDocument();

    // Click "Pending" filter - find the button whose text starts with "Pending"
    const allButtons = screen.getAllByRole("button");
    const pendingButton = allButtons.find((b) =>
      b.textContent?.startsWith("Pending")
    );
    fireEvent.click(pendingButton!);

    // Only pending payouts visible
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.queryByText("Juan Cruz")).not.toBeInTheDocument();
    expect(screen.queryByText("Ana Reyes")).not.toBeInTheDocument();
  });

  it('shows "Mark as Paid" button for pending payouts', () => {
    render(<PayoutList payouts={mockPayouts} />);

    expect(screen.getByText("Mark as Paid")).toBeInTheDocument();
  });

  it('shows "Reject" button for pending payouts', () => {
    render(<PayoutList payouts={mockPayouts} />);

    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("hides action buttons for non-pending payouts", () => {
    // Only paid and rejected payouts
    const nonPendingPayouts = mockPayouts.filter(
      (p) => p.status !== "pending"
    );
    render(<PayoutList payouts={nonPendingPayouts} />);

    expect(screen.queryByText("Mark as Paid")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  it("shows pending payout count badge", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // There's 1 pending payout, so badge should show "1"
    // The badge is inside the "Pending" filter button
    const allButtons = screen.getAllByRole("button");
    const pendingButton = allButtons.find((b) =>
      b.textContent?.startsWith("Pending")
    );
    expect(pendingButton).toBeTruthy();
    expect(pendingButton?.textContent).toContain("1");
  });

  it("formats currency amounts correctly", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // PHP currency format: ₱1,500 ₱2,500 ₱500
    expect(screen.getByText(/₱1,500/)).toBeInTheDocument();
    expect(screen.getByText(/₱2,500/)).toBeInTheDocument();
    expect(screen.getByText(/₱500/)).toBeInTheDocument();
  });

  it("empty state when no payouts match filter", () => {
    // Only pending payouts
    const pendingOnly = mockPayouts.filter((p) => p.status === "pending");
    render(<PayoutList payouts={pendingOnly} />);

    // Click "Rejected" filter - no pending payouts have this status
    const allButtons = screen.getAllByRole("button");
    const rejectedButton = allButtons.find(
      (b) => b.textContent === "Rejected"
    );
    fireEvent.click(rejectedButton!);

    // Should show empty state
    expect(
      screen.getByText("No payouts match the selected filter.")
    ).toBeInTheDocument();
  });

  it("opens reject reason form when Reject is clicked", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // Click "Reject" button
    fireEvent.click(screen.getByText("Reject"));

    // Rejection form should appear
    expect(
      screen.getByPlaceholderText("Enter rejection reason...")
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm Rejection")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("closes reject reason form when Cancel is clicked", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // Open reject form
    fireEvent.click(screen.getByText("Reject"));
    expect(
      screen.getByPlaceholderText("Enter rejection reason...")
    ).toBeInTheDocument();

    // Click Cancel
    fireEvent.click(screen.getByText("Cancel"));

    // Form should be gone
    expect(
      screen.queryByPlaceholderText("Enter rejection reason...")
    ).not.toBeInTheDocument();
  });

  it("disables Confirm Rejection button when reason is empty", () => {
    render(<PayoutList payouts={mockPayouts} />);

    // Open reject form
    fireEvent.click(screen.getByText("Reject"));

    // Confirm button should be disabled with empty reason
    const confirmButton = screen.getByText("Confirm Rejection");
    expect(confirmButton).toBeDisabled();
  });
});
