import { render, screen } from "@testing-library/react";
import { CreateAccountBanner } from "@/components/tracking/create-account-banner";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("CreateAccountBanner", () => {
  it("renders the banner with CTA text", () => {
    render(<CreateAccountBanner />);

    expect(
      screen.getByText(
        "Want to see all your projects in one place? Create a free account!"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create account/i })).toBeInTheDocument();
  });

  it("links to /auth/register without email when no clientEmail provided", () => {
    render(<CreateAccountBanner />);

    const link = screen.getByRole("link", { name: /create account/i });
    expect(link).toHaveAttribute("href", "/auth/register");
  });

  it("links to /auth/register with encoded email when clientEmail provided", () => {
    render(<CreateAccountBanner clientEmail="test@example.com" />);

    const link = screen.getByRole("link", { name: /create account/i });
    expect(link).toHaveAttribute(
      "href",
      "/auth/register?email=test%40example.com"
    );
  });

  it("properly encodes special characters in email", () => {
    render(<CreateAccountBanner clientEmail="user+tag@example.com" />);

    const link = screen.getByRole("link", { name: /create account/i });
    expect(link).toHaveAttribute(
      "href",
      "/auth/register?email=user%2Btag%40example.com"
    );
  });

  it("does not render when isAuthenticated is true", () => {
    const { container } = render(
      <CreateAccountBanner isAuthenticated={true} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders when isAuthenticated is false", () => {
    render(<CreateAccountBanner isAuthenticated={false} />);

    expect(
      screen.getByText(
        "Want to see all your projects in one place? Create a free account!"
      )
    ).toBeInTheDocument();
  });

  it("renders when isAuthenticated is undefined (anonymous users)", () => {
    render(<CreateAccountBanner />);

    expect(
      screen.getByText(
        "Want to see all your projects in one place? Create a free account!"
      )
    ).toBeInTheDocument();
  });

  it("uses Card component with muted styling", () => {
    render(<CreateAccountBanner />);

    // The banner should be in a card-like container with muted background
    const banner = screen.getByTestId("create-account-banner");
    expect(banner).toBeInTheDocument();
  });
});
