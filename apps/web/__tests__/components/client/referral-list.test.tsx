import { render, screen } from "@testing-library/react";
import {
  ReferralList,
  maskEmail,
  type ReferralListProps,
} from "@/components/client/referral-list";

const makeReferral = (overrides: Partial<ReferralListProps["referrals"][0]> = {}) => ({
  id: `ref-${Math.random().toString(36).slice(2)}`,
  referred_email: "john@gmail.com",
  status: "signed_up" as const,
  reward_amount: null,
  reward_status: null,
  created_at: "2026-01-15T10:00:00Z",
  ...overrides,
});

describe("maskEmail", () => {
  it("masks email correctly — shows first 2 chars + domain", () => {
    expect(maskEmail("john@gmail.com")).toBe("jo***@gmail.com");
  });

  it("masks short local part", () => {
    expect(maskEmail("ab@example.com")).toBe("ab***@example.com");
  });

  it("masks single character local part", () => {
    expect(maskEmail("a@test.com")).toBe("a***@test.com");
  });

  it("returns email as-is when no @ symbol", () => {
    expect(maskEmail("invalid-email")).toBe("invalid-email");
  });
});

describe("ReferralList", () => {
  it("shows empty state when no referrals", () => {
    render(<ReferralList referrals={[]} />);

    expect(screen.getByText("No referrals yet")).toBeInTheDocument();
    expect(
      screen.getByText("Share your code to get started!")
    ).toBeInTheDocument();
  });

  it("renders masked email for each referral", () => {
    const referrals = [
      makeReferral({ referred_email: "john@gmail.com" }),
      makeReferral({ referred_email: "alice@yahoo.com" }),
    ];
    render(<ReferralList referrals={referrals} />);

    expect(screen.getByText("jo***@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("al***@yahoo.com")).toBeInTheDocument();
  });

  it("renders signed_up status badge", () => {
    render(
      <ReferralList referrals={[makeReferral({ status: "signed_up" })]} />
    );

    const badge = screen.getByText("Signed Up");
    expect(badge).toBeInTheDocument();
    // Blue badge for signed_up
    expect(badge.className).toContain("blue");
  });

  it("renders converted status badge", () => {
    render(
      <ReferralList referrals={[makeReferral({ status: "converted" })]} />
    );

    const badge = screen.getByText("Converted");
    expect(badge).toBeInTheDocument();
    // Green badge for converted
    expect(badge.className).toContain("green");
  });

  it("renders pending reward status badge", () => {
    render(
      <ReferralList
        referrals={[
          makeReferral({
            status: "converted",
            reward_amount: 100,
            reward_status: "pending",
          }),
        ]}
      />
    );

    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("yellow");
  });

  it("renders available reward status badge", () => {
    render(
      <ReferralList
        referrals={[
          makeReferral({
            status: "converted",
            reward_amount: 100,
            reward_status: "available",
          }),
        ]}
      />
    );

    const badge = screen.getByText("Available");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("green");
  });

  it("renders redeemed reward status badge", () => {
    render(
      <ReferralList
        referrals={[
          makeReferral({
            status: "converted",
            reward_amount: 100,
            reward_status: "redeemed",
          }),
        ]}
      />
    );

    const badge = screen.getByText("Redeemed");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("gray");
  });

  it("renders paid reward status badge", () => {
    render(
      <ReferralList
        referrals={[
          makeReferral({
            status: "converted",
            reward_amount: 100,
            reward_status: "paid",
          }),
        ]}
      />
    );

    const badge = screen.getByText("Paid");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("green");
  });

  it("displays reward amount for converted referrals", () => {
    render(
      <ReferralList
        referrals={[
          makeReferral({
            status: "converted",
            reward_amount: 500,
            reward_status: "available",
          }),
        ]}
      />
    );

    expect(screen.getByText(/₱500/)).toBeInTheDocument();
  });

  it("formats dates as relative text", () => {
    // "Today" case — use a time from today
    const now = new Date();
    const todayStr = now.toISOString();
    render(
      <ReferralList referrals={[makeReferral({ created_at: todayStr })]} />
    );

    expect(screen.getByText(/Today/)).toBeInTheDocument();
  });
});
