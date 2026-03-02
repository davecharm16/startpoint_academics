/**
 * Tests for the SocialSettingsForm component
 *
 * Validates:
 * - Renders section for Like Our Page
 * - Renders section for Follow Us
 * - Renders section for Share a Post
 * - Renders enable/disable toggle for each action
 * - Renders discount amount input for each action
 * - Renders instruction text input for each action
 * - Renders social URL input for each action
 * - Renders save button
 * - Pre-populates with existing settings
 * - Uses default values when no settings provided
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/admin/settings",
}));

// Mock @startpoint/supabase/client
jest.mock("@startpoint/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
      insert: jest.fn(() => ({ error: null })),
    })),
  })),
}));

// Mock @startpoint/ui - render real HTML elements with forwardRef for Input
jest.mock("@startpoint/ui", () => ({
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("button", props, children),
  Input: React.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<HTMLInputElement>) =>
      React.createElement("input", { ...props, ref })
  ),
  Label: ({
    children,
    htmlFor,
    ...props
  }: React.PropsWithChildren<
    { htmlFor?: string } & Record<string, unknown>
  >) => React.createElement("label", { htmlFor, ...props }, children),
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    [key: string]: unknown;
  }) =>
    React.createElement("button", {
      role: "switch",
      "aria-checked": checked,
      onClick: () => onCheckedChange?.(!checked),
      ...props,
    }),
  Alert: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("div", { role: "alert", ...props }, children),
  AlertDescription: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("p", props, children),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Loader2: () =>
    React.createElement("span", { "data-testid": "loader-icon" }),
  Check: () => React.createElement("span", { "data-testid": "check-icon" }),
  AlertCircle: () =>
    React.createElement("span", { "data-testid": "alert-icon" }),
}));

// Import the component after mocks
import { SocialSettingsForm } from "@/components/admin/social-settings-form";

const existingActions = [
  {
    id: "social-1",
    action_type: "like_page" as const,
    is_enabled: false,
    discount_amount: 75,
    instruction_text: "Like our FB page",
    social_url: "https://facebook.com/test",
  },
  {
    id: "social-2",
    action_type: "follow_page" as const,
    is_enabled: true,
    discount_amount: 60,
    instruction_text: "Follow our page",
    social_url: "https://facebook.com/test2",
  },
  {
    id: "social-3",
    action_type: "share_post" as const,
    is_enabled: false,
    discount_amount: 150,
    instruction_text: "Share our post",
    social_url: "https://facebook.com/test3",
  },
];

describe("SocialSettingsForm", () => {
  it("renders section for Like Our Page", () => {
    render(<SocialSettingsForm actions={[]} />);

    expect(screen.getByText("Like Our Page")).toBeInTheDocument();
  });

  it("renders section for Follow Us", () => {
    render(<SocialSettingsForm actions={[]} />);

    expect(screen.getByText("Follow Us")).toBeInTheDocument();
  });

  it("renders section for Share a Post", () => {
    render(<SocialSettingsForm actions={[]} />);

    expect(screen.getByText("Share a Post")).toBeInTheDocument();
  });

  it("renders enable/disable toggle for each action", () => {
    render(<SocialSettingsForm actions={[]} />);

    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(3);

    expect(
      screen.getByLabelText("Enable Like Our Page")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Enable Follow Us")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Enable Share a Post")
    ).toBeInTheDocument();
  });

  it("renders discount amount input for each action", () => {
    render(<SocialSettingsForm actions={[]} />);

    const likeDiscount = document.getElementById("like_page_discount_amount");
    expect(likeDiscount).toBeInTheDocument();
    expect(likeDiscount).toHaveAttribute("type", "number");

    const followDiscount = document.getElementById("follow_page_discount_amount");
    expect(followDiscount).toBeInTheDocument();
    expect(followDiscount).toHaveAttribute("type", "number");

    const shareDiscount = document.getElementById("share_post_discount_amount");
    expect(shareDiscount).toBeInTheDocument();
    expect(shareDiscount).toHaveAttribute("type", "number");
  });

  it("renders instruction text input for each action", () => {
    render(<SocialSettingsForm actions={[]} />);

    expect(
      document.getElementById("like_page_instruction_text")
    ).toBeInTheDocument();
    expect(
      document.getElementById("follow_page_instruction_text")
    ).toBeInTheDocument();
    expect(
      document.getElementById("share_post_instruction_text")
    ).toBeInTheDocument();
  });

  it("renders social URL input for each action", () => {
    render(<SocialSettingsForm actions={[]} />);

    expect(
      document.getElementById("like_page_social_url")
    ).toBeInTheDocument();
    expect(
      document.getElementById("follow_page_social_url")
    ).toBeInTheDocument();
    expect(
      document.getElementById("share_post_social_url")
    ).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<SocialSettingsForm actions={[]} />);

    expect(
      screen.getByRole("button", { name: /save social settings/i })
    ).toBeInTheDocument();
  });

  it("pre-populates with existing settings", () => {
    render(<SocialSettingsForm actions={existingActions} />);

    // Like Page toggle is disabled (false)
    const likeToggle = screen.getByLabelText("Enable Like Our Page");
    expect(likeToggle).toHaveAttribute("aria-checked", "false");

    // Like Page discount amount is 75
    const likeDiscount = document.getElementById(
      "like_page_discount_amount"
    ) as HTMLInputElement;
    expect(likeDiscount).toHaveValue(75);

    // Like Page instruction text
    const likeInstruction = document.getElementById(
      "like_page_instruction_text"
    ) as HTMLInputElement;
    expect(likeInstruction).toHaveValue("Like our FB page");

    // Like Page social URL
    const likeUrl = document.getElementById(
      "like_page_social_url"
    ) as HTMLInputElement;
    expect(likeUrl).toHaveValue("https://facebook.com/test");

    // Follow Page toggle is enabled (true)
    const followToggle = screen.getByLabelText("Enable Follow Us");
    expect(followToggle).toHaveAttribute("aria-checked", "true");

    // Follow Page discount amount is 60
    const followDiscount = document.getElementById(
      "follow_page_discount_amount"
    ) as HTMLInputElement;
    expect(followDiscount).toHaveValue(60);

    // Share Post toggle is disabled (false)
    const shareToggle = screen.getByLabelText("Enable Share a Post");
    expect(shareToggle).toHaveAttribute("aria-checked", "false");

    // Share Post discount amount is 150
    const shareDiscount = document.getElementById(
      "share_post_discount_amount"
    ) as HTMLInputElement;
    expect(shareDiscount).toHaveValue(150);
  });

  it("uses default values when no settings provided", () => {
    render(<SocialSettingsForm actions={[]} />);

    // All toggles enabled by default
    const switches = screen.getAllByRole("switch");
    for (const toggle of switches) {
      expect(toggle).toHaveAttribute("aria-checked", "true");
    }

    // Like Page default discount: 50
    const likeDiscount = document.getElementById(
      "like_page_discount_amount"
    ) as HTMLInputElement;
    expect(likeDiscount).toHaveValue(50);

    // Follow Page default discount: 50
    const followDiscount = document.getElementById(
      "follow_page_discount_amount"
    ) as HTMLInputElement;
    expect(followDiscount).toHaveValue(50);

    // Share Post default discount: 100
    const shareDiscount = document.getElementById(
      "share_post_discount_amount"
    ) as HTMLInputElement;
    expect(shareDiscount).toHaveValue(100);

    // Instruction text and URLs default to empty
    const likeInstruction = document.getElementById(
      "like_page_instruction_text"
    ) as HTMLInputElement;
    expect(likeInstruction).toHaveValue("");

    const likeUrl = document.getElementById(
      "like_page_social_url"
    ) as HTMLInputElement;
    expect(likeUrl).toHaveValue("");
  });
});
