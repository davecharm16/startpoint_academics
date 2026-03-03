import { render, screen, fireEvent } from "@testing-library/react";
import { ReferralLeaderboard } from "@/components/admin/referral-leaderboard";

const mockData = [
  {
    id: "user-1",
    full_name: "Maria Santos",
    referral_code: "MARIA2026",
    total_referrals: 15,
    conversions: 9,
    total_earned: 2500,
    available_balance: 1000,
  },
  {
    id: "user-2",
    full_name: "Juan Cruz",
    referral_code: "JUAN2026",
    total_referrals: 12,
    conversions: 7,
    total_earned: 1500,
    available_balance: 500,
  },
  {
    id: "user-3",
    full_name: "Ana Reyes",
    referral_code: "ANA2026",
    total_referrals: 11,
    conversions: 6,
    total_earned: 1000,
    available_balance: 200,
  },
];

describe("ReferralLeaderboard", () => {
  it("renders table with headers", () => {
    render(<ReferralLeaderboard data={mockData} />);

    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Referral Code")).toBeInTheDocument();
    expect(screen.getByText("Signups")).toBeInTheDocument();
    expect(screen.getByText("Conversions")).toBeInTheDocument();
    expect(screen.getByText("Total Earned")).toBeInTheDocument();
  });

  it("renders leaderboard entries with correct data", () => {
    render(<ReferralLeaderboard data={mockData} />);

    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("MARIA2026")).toBeInTheDocument();
    expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
    expect(screen.getByText("JUAN2026")).toBeInTheDocument();
    expect(screen.getByText("Ana Reyes")).toBeInTheDocument();
    expect(screen.getByText("ANA2026")).toBeInTheDocument();
  });

  it("displays rank numbers starting from 1", () => {
    render(<ReferralLeaderboard data={mockData} />);

    // Rank numbers are rendered inside spans with font-medium class
    const rankElements = screen.getAllByText(/^[123]$/);
    const ranks = rankElements
      .filter((el) => el.classList.contains("font-medium"))
      .map((el) => el.textContent);
    expect(ranks).toEqual(["1", "2", "3"]);
  });

  it("formats currency amounts correctly", () => {
    render(<ReferralLeaderboard data={mockData} />);

    // PHP currency format: ₱2,500
    expect(screen.getByText(/₱2,500/)).toBeInTheDocument();
    expect(screen.getByText(/₱1,500/)).toBeInTheDocument();
    expect(screen.getByText(/₱1,000/)).toBeInTheDocument();
  });

  it("handles empty data array", () => {
    render(<ReferralLeaderboard data={[]} />);

    expect(
      screen.getByText("No referral data available.")
    ).toBeInTheDocument();
  });

  it("clicking a row expands it to show additional details", () => {
    render(<ReferralLeaderboard data={mockData} />);

    // Expanded content should not be visible initially
    expect(screen.queryByText("Conversion Rate:")).not.toBeInTheDocument();
    expect(screen.queryByText("Available Balance:")).not.toBeInTheDocument();

    // Click the first row
    const firstRow = screen.getByText("Maria Santos").closest("tr");
    fireEvent.click(firstRow!);

    // Now expanded content should be visible
    // Maria: 9/15 = 60%
    expect(screen.getByText("Conversion Rate:")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("Available Balance:")).toBeInTheDocument();
  });

  it("clicking an expanded row collapses it", () => {
    render(<ReferralLeaderboard data={mockData} />);

    const firstRow = screen.getByText("Maria Santos").closest("tr");

    // Expand
    fireEvent.click(firstRow!);
    expect(screen.getByText("Conversion Rate:")).toBeInTheDocument();

    // Collapse
    fireEvent.click(firstRow!);
    expect(screen.queryByText("Conversion Rate:")).not.toBeInTheDocument();
  });

  it("displays correct signups and conversions counts", () => {
    render(<ReferralLeaderboard data={mockData} />);

    // Maria Santos: 15 signups, 9 conversions
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();

    // Juan Cruz: 12 signups, 7 conversions
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
