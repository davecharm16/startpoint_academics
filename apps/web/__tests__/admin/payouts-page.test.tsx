import { render, screen } from "@testing-library/react";
import PayoutsPage from "@/app/(auth)/admin/referrals/payouts/page";

// Mock the PayoutList client component
jest.mock("@/components/admin/payout-list", () => ({
  PayoutList: ({ payouts }: { payouts: unknown[] }) => (
    <div data-testid="payout-list">Payout List ({payouts.length} entries)</div>
  ),
}));

// Mock Supabase server client
jest.mock("@startpoint/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    from: (...args: unknown[]) => ({
      select: (...selectArgs: unknown[]) => {
        const tableName = args[0];

        if (tableName === "payout_requests") {
          return {
            order: () =>
              Promise.resolve({
                data: [],
              }),
          };
        }

        if (tableName === "profiles") {
          return {
            in: () =>
              Promise.resolve({
                data: [],
              }),
          };
        }

        return Promise.resolve({ data: [] });
      },
    }),
  }),
}));

describe("PayoutsPage", () => {
  it("renders page title", async () => {
    const Page = await PayoutsPage();
    render(Page);

    expect(screen.getByText("Payout Requests")).toBeInTheDocument();
  });

  it("renders page description", async () => {
    const Page = await PayoutsPage();
    render(Page);

    expect(
      screen.getByText(
        "Review and process cash payout requests from referrers"
      )
    ).toBeInTheDocument();
  });

  it("renders empty state when no payouts", async () => {
    const Page = await PayoutsPage();
    render(Page);

    expect(screen.getByText("No payout requests")).toBeInTheDocument();
    expect(
      screen.getByText("Payout requests from clients will appear here.")
    ).toBeInTheDocument();
  });
});

describe("PayoutsPage with data", () => {
  beforeEach(() => {
    const mockModule = jest.requireMock("@startpoint/supabase/server");
    mockModule.createClient.mockResolvedValue({
      from: (...args: unknown[]) => ({
        select: (...selectArgs: unknown[]) => {
          const tableName = args[0];

          if (tableName === "payout_requests") {
            return {
              order: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "payout-1",
                      user_id: "user-1",
                      amount: 1500,
                      payment_method: "gcash",
                      payment_details: {
                        account_number: "09171234567",
                        account_name: "Maria Santos",
                      },
                      status: "pending",
                      rejection_reason: null,
                      processed_by: null,
                      processed_at: null,
                      created_at: "2026-03-01T10:00:00Z",
                    },
                  ],
                }),
            };
          }

          if (tableName === "profiles") {
            return {
              in: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "user-1",
                      full_name: "Maria Santos",
                      email: "maria@example.com",
                    },
                  ],
                }),
            };
          }

          return Promise.resolve({ data: [] });
        },
      }),
    });
  });

  it("renders payout list component when data exists", async () => {
    const Page = await PayoutsPage();
    render(Page);

    expect(screen.getByTestId("payout-list")).toBeInTheDocument();
    expect(screen.getByText("Payout List (1 entries)")).toBeInTheDocument();
  });
});
