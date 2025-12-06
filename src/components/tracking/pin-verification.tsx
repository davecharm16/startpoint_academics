"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, AlertCircle } from "lucide-react";

interface PinVerificationProps {
  projectId: string;
  token: string;
}

export function PinVerification({ projectId, token }: PinVerificationProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = async () => {
    if (pin.length !== 4) {
      setError("Please enter 4 digits");
      return;
    }

    if (attempts >= 3) {
      setError("Too many attempts. Please try again later.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/track/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, pin, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAttempts((prev) => prev + 1);
        throw new Error(data.error || "Verification failed");
      }

      // Refresh the page to show full details
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="pin">Last 4 digits of phone number</Label>
        <div className="flex gap-2">
          <Input
            id="pin"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(value);
              setError(null);
            }}
            placeholder="e.g., 1234"
            className="text-center text-lg tracking-widest"
            disabled={isVerifying || attempts >= 3}
          />
          <Button
            onClick={handleVerify}
            disabled={pin.length !== 4 || isVerifying || attempts >= 3}
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
          </Button>
        </div>
        {attempts > 0 && attempts < 3 && (
          <p className="text-xs text-muted-foreground">
            {3 - attempts} attempt{3 - attempts !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>
    </div>
  );
}
