/**
 * Tests for reward activation module.
 *
 * Story 8-11 (Referrer Reward Tracking)
 * HIGH RISK: Balance updates — TDD mandatory.
 *
 * Note: The activateReferralReward function requires Supabase and cannot be
 * fully unit-tested without integration setup. These tests verify the module
 * structure and exports, and that the function handles edge cases gracefully
 * when mocked.
 */

// Mock the Supabase admin client
const mockSingle = jest.fn();
const mockEq = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: mockSingle }), single: mockSingle });
const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn() }) });
const mockInsert = jest.fn();
const mockFrom = jest.fn().mockReturnValue({
  select: mockSelect,
  update: mockUpdate,
  insert: mockInsert,
});

jest.mock("@startpoint/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { activateReferralReward } from "@/lib/reward-activation";

describe("activateReferralReward", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock chain
    mockSingle.mockReset();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      insert: mockInsert,
    });
  });

  it("is exported as a function", () => {
    expect(typeof activateReferralReward).toBe("function");
  });

  it("returns { success: true, rewardActivated: false } when project is not found", async () => {
    // First call to supabase.from("projects").select().eq().single() returns null
    mockSingle.mockResolvedValueOnce({ data: null });

    const result = await activateReferralReward("non-existent-project-id");

    expect(result).toEqual({ success: true, rewardActivated: false });
  });

  it("returns { success: true, rewardActivated: false } when project has no client_user_id", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: "proj-1", client_user_id: null, client_email: "test@test.com" },
    });

    const result = await activateReferralReward("proj-1");

    expect(result).toEqual({ success: true, rewardActivated: false });
  });

  it("returns an object with success and rewardActivated properties", async () => {
    // Project not found
    mockSingle.mockResolvedValueOnce({ data: null });

    const result = await activateReferralReward("any-id");

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("rewardActivated");
  });

  it("handles errors gracefully and returns error info", async () => {
    mockSingle.mockRejectedValueOnce(new Error("Database connection failed"));

    const result = await activateReferralReward("error-project");

    expect(result.success).toBe(false);
    expect(result.rewardActivated).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Database connection failed");
  });
});
