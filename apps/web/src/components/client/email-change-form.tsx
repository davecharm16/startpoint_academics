"use client";

import { useState } from "react";
import { createClient } from "@startpoint/supabase/client";
import { Button, Input, Label, Alert, AlertDescription } from "@startpoint/ui";
import { Loader2, Check, AlertCircle } from "lucide-react";

export function EmailChangeForm() {
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setNewEmail("");
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
          <AlertDescription>
            Verification email sent to your new address. Your email won&apos;t
            change until verified.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="newEmail">New Email Address</Label>
        <Input
          id="newEmail"
          type="email"
          placeholder="newemail@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading || !newEmail}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Email"
        )}
      </Button>
    </form>
  );
}
