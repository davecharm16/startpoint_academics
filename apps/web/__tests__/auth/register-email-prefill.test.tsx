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

describe("Register Page - Email Pre-fill", () => {
  beforeEach(() => {
    mockSearchParams.clear();
  });

  it("renders the registration form", () => {
    render(<RegisterPage />);

    // CardTitle renders as a div, not a heading — use getAllByText since "Create Account" appears in title and button
    const createAccountElements = screen.getAllByText("Create Account");
    expect(createAccountElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  });

  it("pre-fills the email field when ?email= query param is present", () => {
    mockSearchParams.set("email", "guest@example.com");

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
    expect(emailInput.value).toBe("guest@example.com");
  });

  it("keeps the email field editable when pre-filled", () => {
    mockSearchParams.set("email", "guest@example.com");

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
    expect(emailInput).not.toBeDisabled();
  });

  it("handles both email and ref query params together", () => {
    mockSearchParams.set("email", "guest@example.com");
    mockSearchParams.set("ref", "JOHN1234");

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
    expect(emailInput.value).toBe("guest@example.com");

    const referralInput = screen.getByLabelText(
      /referral code/i
    ) as HTMLInputElement;
    expect(referralInput.value).toBe("JOHN1234");
  });

  it("does not pre-fill email when param is absent", () => {
    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
    expect(emailInput.value).toBe("");
  });

  it("handles URL-decoded email with special characters", () => {
    mockSearchParams.set("email", "user+tag@example.com");

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
    expect(emailInput.value).toBe("user+tag@example.com");
  });
});
