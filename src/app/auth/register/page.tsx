"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerClient, type RegisterInput } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
} from "lucide-react";

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
    <div className="mt-2 space-y-2">
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
            {checks.length ? "✓" : "○"} At least 8 characters
          </li>
          <li className={checks.uppercase ? "text-green-600" : ""}>
            {checks.uppercase ? "✓" : "○"} One uppercase letter
          </li>
          <li className={checks.number ? "text-green-600" : ""}>
            {checks.number ? "✓" : "○"} One number
          </li>
        </ul>
      </div>
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    referralCode: refCode || "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState<string | null>(null);

  useEffect(() => {
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
    }
  }, [refCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    // Check password match
    if (formData.password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerClient(formData);

      if (!result.success) {
        setError(result.error || "Registration failed");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      // Success!
      setSuccess(true);
      setNewReferralCode(result.referralCode || null);

      // Redirect to client dashboard after short delay
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {newReferralCode && (
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Your referral code:
              </p>
              <p className="text-2xl font-bold tracking-widest text-primary">
                {newReferralCode}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Share this with friends to earn rewards!
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Redirecting you to login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to track your projects and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {refCode && (
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve been referred! You&apos;ll get a discount on your first order.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={fieldErrors.fullName ? "border-red-500" : ""}
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-500">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+63 912 345 6789"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={fieldErrors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className={fieldErrors.confirmPassword ? "border-red-500" : ""}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
            <Input
              id="referralCode"
              name="referralCode"
              placeholder="e.g., DAVE1234"
              value={formData.referralCode}
              onChange={handleChange}
              disabled={isLoading}
              className={fieldErrors.referralCode ? "border-red-500" : ""}
            />
            {fieldErrors.referralCode && (
              <p className="text-xs text-red-500">{fieldErrors.referralCode}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Have a referral code? Enter it to get a discount on your first order.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function RegisterFormSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to track your projects and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          ))}
          <div className="h-10 w-full bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
