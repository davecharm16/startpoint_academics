import { createAdminClient } from "@startpoint/supabase/admin";
import { calculateBalanceAfter } from "./referral-engine";

/**
 * Activate a referral reward when a project is completed.
 * This changes the reward from 'pending' to 'available' and updates the referrer's balance.
 *
 * @param projectId - The completed project's ID
 * @returns Object with success status and details
 */
export async function activateReferralReward(projectId: string): Promise<{
  success: boolean;
  rewardActivated: boolean;
  error?: string;
}> {
  const supabase = createAdminClient();

  try {
    // Get the project and its client
    const { data: project } = await supabase
      .from("projects")
      .select("id, client_user_id, client_email")
      .eq("id", projectId)
      .single();

    if (!project) return { success: true, rewardActivated: false };

    const projectData = project as {
      id: string;
      client_user_id: string | null;
      client_email: string;
    };
    const clientId = projectData.client_user_id;

    if (!clientId) return { success: true, rewardActivated: false };

    // Find the referral record for this client with a pending reward
    const { data: referral } = await (
      supabase.from("referrals" as "profiles") as ReturnType<
        typeof supabase.from
      >
    )
      .select("*")
      .eq("referred_id", clientId)
      .eq("reward_status", "pending")
      .single();

    if (!referral) return { success: true, rewardActivated: false };

    const ref = referral as {
      id: string;
      referrer_id: string;
      reward_amount: number;
    };

    if (!ref.reward_amount || ref.reward_amount <= 0) {
      return { success: true, rewardActivated: false };
    }

    // Get referrer's current balance
    const { data: referrer } = await supabase
      .from("profiles")
      .select("reward_balance")
      .eq("id", ref.referrer_id)
      .single();

    const referrerData = referrer as { reward_balance: number } | null;
    const currentBalance = Number(referrerData?.reward_balance || 0);
    const newBalance = calculateBalanceAfter(currentBalance, ref.reward_amount);

    // Update reward status to available
    await (
      supabase.from("referrals" as "profiles") as ReturnType<
        typeof supabase.from
      >
    )
      .update({ reward_status: "available" } as never)
      .eq("id", ref.id);

    // Update referrer's balance
    await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
      .update({ reward_balance: newBalance } as never)
      .eq("id", ref.referrer_id);

    // Create reward transaction
    await (
      supabase.from("reward_transactions" as "profiles") as ReturnType<
        typeof supabase.from
      >
    ).insert({
      user_id: ref.referrer_id,
      type: "referral_reward",
      amount: ref.reward_amount,
      balance_after: newBalance,
      reference_id: projectId,
      reference_type: "project_completion",
      notes: `Referral reward activated - project completed`,
    } as never);

    return { success: true, rewardActivated: true };
  } catch (error) {
    console.error("Reward activation error:", error);
    return { success: false, rewardActivated: false, error: String(error) };
  }
}
