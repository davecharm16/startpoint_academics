import { createClient } from "@startpoint/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/client/profile-form";
import { EmailChangeForm } from "@/components/client/email-change-form";
import { PasswordChangeForm } from "@/components/client/password-change-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@startpoint/ui";
import { User, Mail, Lock } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, referral_code")
    .eq("id", user.id)
    .single();

  const profileData = profile as {
    full_name: string;
    email: string;
    phone: string | null;
    referral_code: string | null;
  } | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your name and phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              userId={user.id}
              fullName={profileData?.full_name || ""}
              phone={profileData?.phone || ""}
              referralCode={profileData?.referral_code || null}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Change Email Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Address
              </CardTitle>
              <CardDescription>
                Current: {profileData?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailChangeForm />
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
