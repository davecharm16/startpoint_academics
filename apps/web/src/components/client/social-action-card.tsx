"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@startpoint/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Alert,
  AlertDescription,
} from "@startpoint/ui";
import {
  ThumbsUp,
  UserPlus,
  Share2,
  ExternalLink,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export interface SocialActionCardProps {
  actionType: "like_page" | "follow_page" | "share_post";
  discountAmount: number;
  instructionText: string;
  socialUrl: string;
  claim: {
    id: string;
    status: "pending" | "verified" | "rejected";
    discount_amount: number | null;
    rejection_reason: string | null;
    verified_at: string | null;
    created_at: string;
  } | null;
  userId: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: typeof ThumbsUp }> =
  {
    like_page: { label: "Like Our Page", icon: ThumbsUp },
    follow_page: { label: "Follow Us", icon: UserPlus },
    share_post: { label: "Share a Post", icon: Share2 },
  };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);

export function SocialActionCard({
  actionType,
  discountAmount,
  instructionText,
  socialUrl,
  claim,
  userId,
}: SocialActionCardProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [socialUsername, setSocialUsername] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actionInfo = ACTION_LABELS[actionType] || {
    label: actionType,
    icon: ThumbsUp,
  };
  const IconComponent = actionInfo.icon;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setError(null);
    setScreenshot(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!socialUsername.trim()) {
      setError("Please enter your social media username or profile link.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Upload screenshot to storage
      let screenshotPath = null;
      if (screenshot) {
        const ext = screenshot.name.split(".").pop();
        const path = `${userId}/${actionType}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("social-proofs")
          .upload(path, screenshot, { cacheControl: "3600", upsert: true });

        if (!uploadError) screenshotPath = path;
      }

      // Create or update claim
      if (claim && claim.status === "rejected") {
        // Resubmission: update existing claim
        await (
          supabase.from(
            "social_claims" as "profiles"
          ) as ReturnType<typeof supabase.from>
        )
          .update({
            social_username: socialUsername,
            screenshot_path: screenshotPath,
            status: "pending",
            rejection_reason: null,
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", claim.id);
      } else {
        // New claim
        await (
          supabase.from(
            "social_claims" as "profiles"
          ) as ReturnType<typeof supabase.from>
        ).insert({
          user_id: userId,
          action_type: actionType,
          social_username: socialUsername,
          screenshot_path: screenshotPath,
          discount_amount: discountAmount,
          status: "pending",
        } as never);
      }

      setShowForm(false);
      setSocialUsername("");
      setScreenshot(null);
      setScreenshotPreview(null);
      router.refresh();
    } catch {
      setError("Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBorderClass = () => {
    if (!claim) return "";
    switch (claim.status) {
      case "pending":
        return "border-l-4 border-l-amber-400";
      case "verified":
        return "border-l-4 border-l-green-500";
      case "rejected":
        return "border-l-4 border-l-red-500";
      default:
        return "";
    }
  };

  const renderStatusBadge = () => {
    if (!claim) return null;

    switch (claim.status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" />
            Awaiting Verification
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  const renderContent = () => {
    // Show inline form
    if (showForm) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`username-${actionType}`}>
              Social Media Username / Profile Link
            </Label>
            <Input
              id={`username-${actionType}`}
              placeholder="Enter your username or profile link"
              value={socialUsername}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSocialUsername(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`screenshot-${actionType}`}>
              Screenshot Proof
            </Label>
            <Input
              id={`screenshot-${actionType}`}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
            />
          </div>

          {screenshotPreview && (
            <div className="mt-2">
              <img
                src={screenshotPreview}
                alt="Screenshot preview"
                className="max-h-32 rounded-md border"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Claim
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    // Available state - no claim
    if (!claim) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{instructionText}</p>
          <a
            href={socialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Visit our page
            <ExternalLink className="h-3 w-3" />
          </a>
          <div className="text-sm font-semibold text-primary">
            Earn {formatCurrency(discountAmount)} discount
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            Claim Reward
          </Button>
        </div>
      );
    }

    // Pending state
    if (claim.status === "pending") {
      return (
        <div className="space-y-3">
          {renderStatusBadge()}
          <p className="text-sm text-muted-foreground">
            Submitted on{" "}
            {new Date(claim.created_at).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <div className="text-sm font-semibold text-primary">
            {formatCurrency(discountAmount)} discount
          </div>
        </div>
      );
    }

    // Verified state
    if (claim.status === "verified") {
      return (
        <div className="space-y-3">
          {renderStatusBadge()}
          <div className="text-sm font-semibold text-green-600">
            Earned {formatCurrency(claim.discount_amount || discountAmount)}
          </div>
          {claim.verified_at && (
            <p className="text-sm text-muted-foreground">
              Verified on{" "}
              {new Date(claim.verified_at).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      );
    }

    // Rejected state
    if (claim.status === "rejected") {
      return (
        <div className="space-y-3">
          {renderStatusBadge()}
          {claim.rejection_reason && (
            <p className="text-sm text-red-600">{claim.rejection_reason}</p>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(true)}
          >
            Resubmit
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={getBorderClass()}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{actionInfo.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
