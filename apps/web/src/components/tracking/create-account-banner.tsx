import Link from "next/link";
import { Card, CardContent } from "@startpoint/ui";
import { Button } from "@startpoint/ui";
import { UserPlus } from "lucide-react";

interface CreateAccountBannerProps {
  clientEmail?: string;
  isAuthenticated?: boolean;
}

export function CreateAccountBanner({
  clientEmail,
  isAuthenticated,
}: CreateAccountBannerProps) {
  // Hide banner for authenticated clients
  if (isAuthenticated) {
    return null;
  }

  const registerUrl = clientEmail
    ? `/auth/register?email=${encodeURIComponent(clientEmail)}`
    : "/auth/register";

  return (
    <Card
      className="bg-muted/50 border"
      data-testid="create-account-banner"
    >
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Want to see all your projects in one place? Create a free account!
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={registerUrl}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
