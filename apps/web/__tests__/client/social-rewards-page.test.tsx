import React from "react";
import { render, screen } from "@testing-library/react";
import ClientSocialRewardsPage from "@/app/(auth)/client/social-rewards/page";

// Mock the SocialActionCard client component
jest.mock("@/components/client/social-action-card", () => ({
  SocialActionCard: ({
    actionType,
    discountAmount,
  }: {
    actionType: string;
    discountAmount: number;
    [key: string]: unknown;
  }) => (
    <div data-testid={`social-action-card-${actionType}`}>
      {actionType} - {discountAmount}
    </div>
  ),
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

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Mock Supabase server client
jest.mock("@startpoint/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { id: "user-123" } },
        }),
    },
    from: (...args: unknown[]) => {
      const tableName = args[0];

      if (tableName === "social_reward_settings") {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "setting-1",
                      action_type: "like_page",
                      is_enabled: true,
                      discount_amount: 50,
                      instruction_text: "Like our page",
                      social_url: "https://facebook.com/test",
                    },
                    {
                      id: "setting-2",
                      action_type: "follow_page",
                      is_enabled: true,
                      discount_amount: 75,
                      instruction_text: "Follow us",
                      social_url: "https://instagram.com/test",
                    },
                  ],
                }),
            }),
          }),
        };
      }

      if (tableName === "social_claims") {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [
                  {
                    id: "claim-1",
                    action_type: "like_page",
                    social_username: "testuser",
                    status: "verified",
                    discount_amount: 50,
                    rejection_reason: null,
                    verified_at: "2026-03-01T00:00:00Z",
                    created_at: "2026-02-28T00:00:00Z",
                  },
                ],
              }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [] }),
        }),
      };
    },
  }),
}));

describe("ClientSocialRewardsPage", () => {
  it('renders page title "Social Rewards"', async () => {
    const Page = await ClientSocialRewardsPage();
    render(Page);

    expect(screen.getByText("Social Rewards")).toBeInTheDocument();
  });

  it("renders progress card", async () => {
    const Page = await ClientSocialRewardsPage();
    render(Page);

    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Social rewards claimed")).toBeInTheDocument();
    // 1 verified out of 2 total actions
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("renders total earned card", async () => {
    const Page = await ClientSocialRewardsPage();
    render(Page);

    expect(screen.getByText("Total Earned")).toBeInTheDocument();
    expect(screen.getByText("From social rewards")).toBeInTheDocument();
    // 1 verified claim at 50 PHP
    expect(screen.getByText(/₱50/)).toBeInTheDocument();
  });

  it("renders social action cards", async () => {
    const Page = await ClientSocialRewardsPage();
    render(Page);

    expect(
      screen.getByTestId("social-action-card-like_page")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("social-action-card-follow_page")
    ).toBeInTheDocument();
  });

  it("renders page subtitle", async () => {
    const Page = await ClientSocialRewardsPage();
    render(Page);

    expect(
      screen.getByText("Earn discounts by engaging with us on social media")
    ).toBeInTheDocument();
  });
});

describe("ClientSocialRewardsPage with no actions", () => {
  beforeEach(() => {
    const mockModule = jest.requireMock("@startpoint/supabase/server");
    mockModule.createClient.mockResolvedValue({
      auth: {
        getUser: () =>
          Promise.resolve({
            data: { user: { id: "user-123" } },
          }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [] }),
          }),
        }),
      }),
    });
  });

  it("renders empty state when no social actions are available", async () => {
    const Page = await ClientSocialRewardsPage();
    render(Page);

    expect(
      screen.getByText(
        "No social rewards are currently available. Check back later!"
      )
    ).toBeInTheDocument();
  });
});
