import { render, screen } from "@testing-library/react";
import { ProjectsEmptyState } from "@/components/client/projects-empty-state";

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

describe("ProjectsEmptyState", () => {
  it("renders the empty state message", () => {
    render(<ProjectsEmptyState />);

    expect(screen.getByText("No projects yet")).toBeInTheDocument();
  });

  it("renders a descriptive subtitle", () => {
    render(<ProjectsEmptyState />);

    expect(
      screen.getByText(
        "Once you submit a project, it will appear here for easy tracking."
      )
    ).toBeInTheDocument();
  });

  it("renders a CTA button linking to packages section", () => {
    render(<ProjectsEmptyState />);

    const ctaLink = screen.getByRole("link", {
      name: /submit your first project/i,
    });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/#packages");
  });

  it("renders an icon", () => {
    render(<ProjectsEmptyState />);

    // The component should have a visual icon element
    const icon = screen.getByTestId("empty-state-icon");
    expect(icon).toBeInTheDocument();
  });
});
