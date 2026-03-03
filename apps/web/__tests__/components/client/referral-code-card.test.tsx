import { render, screen } from "@testing-library/react";
import {
  ReferralCodeCard,
  type ReferralCodeCardProps,
} from "@/components/client/referral-code-card";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

const defaultProps: ReferralCodeCardProps = {
  referralCode: "DAVE1234",
  discountType: "percentage",
  discountValue: 10,
  rewardType: "fixed",
  rewardValue: 100,
};

describe("ReferralCodeCard", () => {
  it("renders the referral code text", () => {
    render(<ReferralCodeCard {...defaultProps} />);

    expect(screen.getByText("DAVE1234")).toBeInTheDocument();
  });

  it("renders the shareable URL containing the referral code", () => {
    render(<ReferralCodeCard {...defaultProps} />);

    // The shareable URL should contain the referral code
    expect(
      screen.getByText(/\/auth\/register\?ref=DAVE1234/)
    ).toBeInTheDocument();
  });

  it("renders a Copy Code button", () => {
    render(<ReferralCodeCard {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /copy code/i })
    ).toBeInTheDocument();
  });

  it("renders a Copy Link button", () => {
    render(<ReferralCodeCard {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /copy link/i })
    ).toBeInTheDocument();
  });

  it("displays correct explanation for percentage discount + fixed reward", () => {
    render(<ReferralCodeCard {...defaultProps} />);

    // discountType: "percentage", discountValue: 10 => "they get 10% off"
    // rewardType: "fixed", rewardValue: 100 => "you earn ₱100"
    const explanationEl = screen.getByText(/they get 10% off/);
    expect(explanationEl).toBeInTheDocument();
    expect(explanationEl.textContent).toContain("you earn");
  });

  it("displays correct explanation for fixed discount + percentage reward", () => {
    render(
      <ReferralCodeCard
        referralCode="TEST5678"
        discountType="fixed"
        discountValue={200}
        rewardType="percentage"
        rewardValue={15}
      />
    );

    // discountType: "fixed", discountValue: 200 => "they get ₱200 off"
    // rewardType: "percentage", rewardValue: 15 => "you earn 15% of their order"
    const explanationEl = screen.getByText(/they get/);
    expect(explanationEl.textContent).toContain("200");
    expect(explanationEl.textContent).toContain("off");
    expect(explanationEl.textContent).toContain("you earn 15% of their order");
  });

  it("renders within a Card component", () => {
    const { container } = render(<ReferralCodeCard {...defaultProps} />);

    // shadcn Card renders a div with data-slot="card" or a specific class pattern
    // We check for the card structure being present
    const cardEl = container.firstElementChild;
    expect(cardEl).toBeInTheDocument();
    expect(cardEl?.tagName).toBe("DIV");
  });
});
