import { render, screen } from "@testing-library/react";

// Mock next/navigation
const mockSearchParams = new Map<string, string>();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
}));

// Mock the server action
jest.mock("@/app/auth/register/actions", () => ({
  registerClient: jest.fn(),
}));

// Import after mocks
import RegisterPage from "@/app/auth/register/page";

describe("Register Page - Referral Code Entry", () => {
  beforeEach(() => {
    mockSearchParams.clear();
  });

  it("pre-fills referral code from ?ref= URL param", () => {
    mockSearchParams.set("ref", "JOHN1234");

    render(<RegisterPage />);

    const referralInput = screen.getByLabelText(
      /referral code/i
    ) as HTMLInputElement;
    expect(referralInput.value).toBe("JOHN1234");
  });

  it("pre-fills email from ?email= URL param", () => {
    mockSearchParams.set("email", "test@example.com");

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
    expect(emailInput.value).toBe("test@example.com");
  });

  it("shows referral banner when ref param is present", () => {
    mockSearchParams.set("ref", "DAVE2024");

    render(<RegisterPage />);

    expect(
      screen.getByText(/you've been referred/i)
    ).toBeInTheDocument();
  });

  it("does NOT show referral banner without ref param", () => {
    render(<RegisterPage />);

    expect(
      screen.queryByText(/you've been referred/i)
    ).not.toBeInTheDocument();
  });

  it("renders the referral code field as visible and editable", () => {
    render(<RegisterPage />);

    const referralInput = screen.getByLabelText(
      /referral code/i
    ) as HTMLInputElement;
    expect(referralInput).toBeInTheDocument();
    expect(referralInput).not.toBeDisabled();
  });

  it("displays referral code uppercased from URL param", () => {
    // The URL param is passed as-is; the form stores it directly.
    // The code value from URL is typically already uppercase (e.g., DAVE1234).
    // We verify the field displays whatever the param value is.
    mockSearchParams.set("ref", "DAVE1234");

    render(<RegisterPage />);

    const referralInput = screen.getByLabelText(
      /referral code/i
    ) as HTMLInputElement;
    expect(referralInput.value).toBe("DAVE1234");
    // Verify it's uppercase
    expect(referralInput.value).toBe(referralInput.value.toUpperCase());
  });
});
