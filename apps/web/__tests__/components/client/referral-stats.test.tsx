import { render, screen } from "@testing-library/react";
import {
  ReferralStats,
  type ReferralStatsProps,
} from "@/components/client/referral-stats";

const makeReferral = (
  status: "signed_up" | "converted",
  rewardAmount: number | null = null,
  rewardStatus: string | null = null
) => ({
  id: `ref-${Math.random().toString(36).slice(2)}`,
  status,
  reward_amount: rewardAmount,
  reward_status: rewardStatus,
});

const makeTransaction = (type: string, amount: number) => ({
  type,
  amount,
});

describe("ReferralStats", () => {
  it("renders all 4 stat cards", () => {
    const props: ReferralStatsProps = {
      referrals: [],
      transactions: [],
    };
    render(<ReferralStats {...props} />);

    expect(screen.getByText("Total Referrals")).toBeInTheDocument();
    expect(screen.getByText("Conversions")).toBeInTheDocument();
    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
    expect(screen.getByText("Total Earned")).toBeInTheDocument();
  });

  it("calculates total referrals count", () => {
    const props: ReferralStatsProps = {
      referrals: [
        makeReferral("signed_up"),
        makeReferral("converted"),
        makeReferral("signed_up"),
      ],
      transactions: [],
    };
    render(<ReferralStats {...props} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calculates conversions count", () => {
    const props: ReferralStatsProps = {
      referrals: [
        makeReferral("signed_up"),
        makeReferral("converted"),
        makeReferral("converted"),
        makeReferral("signed_up"),
      ],
      transactions: [],
    };
    render(<ReferralStats {...props} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calculates conversion rate correctly", () => {
    const props: ReferralStatsProps = {
      referrals: [
        makeReferral("signed_up"),
        makeReferral("converted"),
        makeReferral("signed_up"),
        makeReferral("converted"),
      ],
      transactions: [],
    };
    render(<ReferralStats {...props} />);

    // 2 out of 4 = 50%
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows 0% conversion rate when no referrals", () => {
    const props: ReferralStatsProps = {
      referrals: [],
      transactions: [],
    };
    render(<ReferralStats {...props} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("formats total earned currency amount from referral_reward transactions", () => {
    const props: ReferralStatsProps = {
      referrals: [],
      transactions: [
        makeTransaction("referral_reward", 500),
        makeTransaction("referral_reward", 300),
        makeTransaction("payout", -200),
        makeTransaction("redemption", -100),
      ],
    };
    render(<ReferralStats {...props} />);

    // Only referral_reward with amount > 0 should count: 500 + 300 = 800
    expect(screen.getByText(/₱800/)).toBeInTheDocument();
  });

  it("shows zero earned when no qualifying transactions", () => {
    const props: ReferralStatsProps = {
      referrals: [makeReferral("signed_up")],
      transactions: [makeTransaction("payout", -100)],
    };
    render(<ReferralStats {...props} />);

    // ₱0 formatted
    expect(screen.getByText(/₱0/)).toBeInTheDocument();
  });
});
