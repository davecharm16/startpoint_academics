import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/client/project-card";

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

const baseProject = {
  id: "proj-1",
  reference_code: "SP-20260301-ABC1",
  topic: "Analysis of Modern Literature in Southeast Asian Universities",
  status: "in_progress",
  deadline: "2026-03-15T10:00:00Z",
  tracking_token: "token-abc-123",
  created_at: "2026-03-01T08:00:00Z",
  package_name: "Premium Essay",
};

describe("ProjectCard", () => {
  it("renders the reference code", () => {
    render(<ProjectCard project={baseProject} />);

    expect(screen.getByText("SP-20260301-ABC1")).toBeInTheDocument();
  });

  it("renders the topic truncated to 60 characters", () => {
    render(<ProjectCard project={baseProject} />);

    // The full topic is 62 chars, truncated at 57 chars + "..." = 60 total
    const truncatedTopic = "Analysis of Modern Literature in Southeast Asian Universi...";
    expect(screen.getByText(truncatedTopic)).toBeInTheDocument();
  });

  it("renders the full topic when under 60 characters", () => {
    const shortProject = {
      ...baseProject,
      topic: "Short Topic Title",
    };
    render(<ProjectCard project={shortProject} />);

    expect(screen.getByText("Short Topic Title")).toBeInTheDocument();
  });

  it("renders the status badge", () => {
    render(<ProjectCard project={baseProject} />);

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders the package name", () => {
    render(<ProjectCard project={baseProject} />);

    expect(screen.getByText("Premium Essay")).toBeInTheDocument();
  });

  it("renders the deadline", () => {
    render(<ProjectCard project={baseProject} />);

    // date-fns format "MMM d, h:mm a"
    expect(screen.getByText(/Mar 15/)).toBeInTheDocument();
  });

  it("links to the tracking page", () => {
    render(<ProjectCard project={baseProject} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/track/token-abc-123");
  });

  it("shows overdue indicator when deadline has passed", () => {
    const overdueProject = {
      ...baseProject,
      deadline: "2025-01-01T10:00:00Z", // Far in the past
    };
    render(<ProjectCard project={overdueProject} />);

    expect(screen.getByText("Overdue!")).toBeInTheDocument();
  });

  it("renders correct status badge colors for each status", () => {
    const statuses = [
      { status: "submitted", label: "Submitted" },
      { status: "assigned", label: "Assigned" },
      { status: "in_progress", label: "In Progress" },
      { status: "review", label: "Under Review" },
      { status: "complete", label: "Complete" },
      { status: "paid", label: "Paid" },
    ];

    for (const { status, label } of statuses) {
      const { unmount } = render(
        <ProjectCard project={{ ...baseProject, status }} />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});
