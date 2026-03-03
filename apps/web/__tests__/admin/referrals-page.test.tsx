import { render, screen } from "@testing-library/react";
import ReferralsPage from "@/app/(auth)/admin/referrals/page";

// Mock the ReferralLeaderboard client component
jest.mock("@/components/admin/referral-leaderboard", () => ({
  ReferralLeaderboard: ({ data }: { data: unknown[] }) => (
    <div data-testid="referral-leaderboard">Leaderboard ({data.length} entries)</div>
  ),
}));

// Mock Supabase server client
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockNot = jest.fn();

jest.mock("@startpoint/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    from: (...args: unknown[]) => {
      mockFrom(...args);
      return {
        select: (...selectArgs: unknown[]) => {
          mockSelect(...selectArgs);
          const tableName = args[0];

          if (tableName === "referrals") {
            return Promise.resolve({
              data: [
                {
                  id: "ref-1",
                  referrer_id: "user-1",
                  referred_id: "user-2",
                  referred_email: "referred@test.com",
                  status: "converted",
                  reward_amount: 500,
                  reward_status: "paid",
                  converted_at: "2026-03-01",
                  created_at: "2026-02-15",
                },
                {
                  id: "ref-2",
                  referrer_id: "user-1",
                  referred_id: null,
                  referred_email: "pending@test.com",
                  status: "signed_up",
                  reward_amount: null,
                  reward_status: null,
                  converted_at: null,
                  created_at: "2026-02-20",
                },
              ],
            });
          }

          if (tableName === "reward_transactions") {
            return Promise.resolve({
              data: [
                { type: "payout", amount: -500 },
                { type: "earned", amount: 500 },
              ],
            });
          }

          if (tableName === "referral_leaderboard") {
            return Promise.resolve({ data: [] });
          }

          if (tableName === "projects") {
            return {
              not: (...notArgs: unknown[]) => {
                mockNot(...notArgs);
                return Promise.resolve({
                  data: [
                    { agreed_price: 3000, client_user_id: "user-2" },
                  ],
                });
              },
            };
          }

          return Promise.resolve({ data: [] });
        },
      };
    },
  }),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Users: (props: any) => <svg data-testid="icon-users" {...props} />,
  TrendingUp: (props: any) => <svg data-testid="icon-trending" {...props} />,
  Percent: (props: any) => <svg data-testid="icon-percent" {...props} />,
  Coins: (props: any) => <svg data-testid="icon-coins" {...props} />,
  DollarSign: (props: any) => <svg data-testid="icon-dollar" {...props} />,
}));

describe("ReferralsPage", () => {
  it("renders page title and description", async () => {
    const Page = await ReferralsPage();
    render(Page);

    expect(screen.getByText("Referral Analytics")).toBeInTheDocument();
    expect(
      screen.getByText("Monitor referral program performance and top referrers")
    ).toBeInTheDocument();
  });

  it("renders stat cards with correct values", async () => {
    const Page = await ReferralsPage();
    render(Page);

    // Total Referrals card
    expect(screen.getByText("Total Referrals")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Conversions card
    expect(screen.getByText("Conversions")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    // Conversion Rate card
    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();

    // Total Rewards Paid card
    expect(screen.getByText("Total Rewards Paid")).toBeInTheDocument();

    // Referred Revenue card
    expect(screen.getByText("Referred Revenue")).toBeInTheDocument();
  });

  it("renders empty state when no leaderboard data", async () => {
    const Page = await ReferralsPage();
    render(Page);

    // The leaderboard mock returns empty, so we should see the empty state
    expect(screen.getByText("No referral data yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Referral analytics will appear here once clients start referring."
      )
    ).toBeInTheDocument();
  });

  it("renders Top Referrers section header", async () => {
    const Page = await ReferralsPage();
    render(Page);

    expect(screen.getByText("Top Referrers")).toBeInTheDocument();
  });
});

describe("ReferralsPage with leaderboard data", () => {
  beforeEach(() => {
    // Override the mock to return leaderboard data
    const mockModule = jest.requireMock("@startpoint/supabase/server");
    mockModule.createClient.mockResolvedValue({
      from: (...args: unknown[]) => ({
        select: (...selectArgs: unknown[]) => {
          const tableName = args[0];

          if (tableName === "referral_leaderboard") {
            return Promise.resolve({
              data: [
                {
                  id: "user-1",
                  full_name: "Maria Santos",
                  referral_code: "MARIA2026",
                  total_referrals: 10,
                  conversions: 5,
                  total_earned: 2500,
                  available_balance: 1000,
                },
              ],
            });
          }

          if (tableName === "referrals") {
            return Promise.resolve({ data: [] });
          }

          if (tableName === "reward_transactions") {
            return Promise.resolve({ data: [] });
          }

          if (tableName === "projects") {
            return {
              not: () => Promise.resolve({ data: [] }),
            };
          }

          return Promise.resolve({ data: [] });
        },
      }),
    });
  });

  it("renders leaderboard component when data exists", async () => {
    const Page = await ReferralsPage();
    render(Page);

    expect(screen.getByTestId("referral-leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard (1 entries)")).toBeInTheDocument();
  });
});
