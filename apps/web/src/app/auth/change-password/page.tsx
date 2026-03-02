import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the client component with SSR disabled
// This prevents Supabase client creation during build-time static generation
const ChangePasswordForm = dynamic(
  () => import("./ChangePasswordForm"),
  { ssr: false }
);

export default function ChangePasswordPage() {
  return (
    <Suspense>
      <ChangePasswordForm />
    </Suspense>
  );
}
