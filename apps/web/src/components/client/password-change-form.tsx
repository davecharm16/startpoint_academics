"use client";

import { useState } from "react";
import { createClient } from "@startpoint/supabase/client";
import { Button, Input, Label, Alert, AlertDescription } from "@startpoint/ui";
import { Loader2, Check, AlertCircle } from "lucide-react";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel =
    strength === 0
      ? ""
      : strength === 1
      ? "Weak"
      : strength === 2
      ? "Medium"
      : "Strong";
  const strengthColor =
    strength === 1
      ? "bg-red-500"
      : strength === 2
      ? "bg-yellow-500"
      : strength === 3
      ? "bg-green-500"
      : "bg-muted";

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2" data-testid="password-strength-indicator">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded ${
              level <= strength ? strengthColor : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">{strengthLabel}</p>
        <ul className="space-y-0.5">
          <li className={checks.length ? "text-green-600" : ""}>
            {checks.length ? "\u2713" : "\u25CB"} At least 8 characters
          </li>
          <li className={checks.uppercase ? "text-green-600" : ""}>
            {checks.uppercase ? "\u2713" : "\u25CB"} One uppercase letter
          </li>
          <li className={checks.number ? "text-green-600" : ""}>
            {checks.number ? "\u2713" : "\u25CB"} One number
          </li>
        </ul>
      </div>
    </div>
  );
}

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[0-9]/.test(newPassword);

  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordValid) {
      setError(
        "Password must be at least 8 characters with one uppercase letter and one number."
      );
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Verify current password by attempting sign-in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setError("Unable to verify current user.");
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect.");
        setIsLoading(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>Password changed successfully.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
          required
        />
        <PasswordStrengthIndicator password={newPassword} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
        />
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-500">Passwords do not match</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
}
