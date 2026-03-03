import { render, screen } from "@testing-library/react";
import { ClientNav } from "@/components/layout/client-nav";

// Mock next/navigation
const mockPathname = "/client";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

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

// Mock @startpoint/supabase/client
jest.mock("@startpoint/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: jest.fn().mockResolvedValue({}),
    },
  }),
}));

// Mock @startpoint/ui - Sheet and Dropdown need special handling for testing
jest.mock("@startpoint/ui", () => {
  const actual = jest.requireActual("@startpoint/ui");
  return {
    ...actual,
    // Sheet renders children directly (no portal)
    Sheet: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SheetTrigger: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
      className?: string;
    }) => (
      <div data-testid="sheet-trigger" className={className}>
        {children}
      </div>
    ),
    SheetContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sheet-content">{children}</div>
    ),
    // DropdownMenu renders children directly (no portal)
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DropdownMenuTrigger: ({
      children,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
    }) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-content">{children}</div>
    ),
    DropdownMenuItem: ({
      children,
      onClick,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
    }) => (
      <div role="menuitem" onClick={onClick}>
        {children}
      </div>
    ),
    DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DropdownMenuSeparator: () => <hr />,
  };
});

const mockUser = {
  id: "user-123",
  full_name: "Test Client",
  email: "client@example.com",
  referral_code: "TEST1234",
};

describe("ClientNav", () => {
  it("renders all navigation items in both mobile and desktop views", () => {
    render(<ClientNav user={mockUser} />);

    // Each nav item appears twice: once in mobile Sheet, once in desktop nav
    const projectLinks = screen.getAllByText("My Projects");
    expect(projectLinks.length).toBe(2);

    const referralLinks = screen.getAllByText("Referrals");
    expect(referralLinks.length).toBe(2);

    const socialLinks = screen.getAllByText("Social Rewards");
    expect(socialLinks.length).toBe(2);

    const profileLinks = screen.getAllByText("Profile");
    expect(profileLinks.length).toBe(2);
  });

  it("renders the Client Portal logo text", () => {
    render(<ClientNav user={mockUser} />);

    // Appears in both mobile sheet header and desktop logo
    const portalTexts = screen.getAllByText("Client Portal");
    expect(portalTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the user's full name in the dropdown", () => {
    render(<ClientNav user={mockUser} />);

    // full_name appears in dropdown trigger + dropdown label
    const nameElements = screen.getAllByText("Test Client");
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the user's email in the dropdown", () => {
    render(<ClientNav user={mockUser} />);

    expect(screen.getByText("client@example.com")).toBeInTheDocument();
  });

  it("renders the referral code in the header", () => {
    render(<ClientNav user={mockUser} />);

    // Referral code appears in both mobile menu and desktop header
    const codeElements = screen.getAllByText("TEST1234");
    expect(codeElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders sign out option", () => {
    render(<ClientNav user={mockUser} />);

    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("has navigation links with correct hrefs", () => {
    render(<ClientNav user={mockUser} />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/client/projects");
    expect(hrefs).toContain("/client/referrals");
    expect(hrefs).toContain("/client/social-rewards");
    expect(hrefs).toContain("/client/profile");
  });

  it("renders mobile hamburger menu trigger", () => {
    render(<ClientNav user={mockUser} />);

    expect(screen.getByText("Toggle menu")).toBeInTheDocument();
  });

  it("does not render referral code when not provided", () => {
    const userWithoutReferral = {
      id: "user-123",
      full_name: "Test Client",
      email: "client@example.com",
    };
    render(<ClientNav user={userWithoutReferral} />);

    expect(screen.queryByText("TEST1234")).not.toBeInTheDocument();
    expect(screen.queryByText("Ref:")).not.toBeInTheDocument();
  });
});
