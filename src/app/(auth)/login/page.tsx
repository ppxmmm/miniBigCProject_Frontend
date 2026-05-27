import * as React from "react";
import { RedirectIfAuthenticated } from "@/components/auth/route-guard";
import { LoginPage } from "@/components/pages/login";

export default function Page() {
  return (
    <RedirectIfAuthenticated>
      <React.Suspense>
        <LoginPage />
      </React.Suspense>
    </RedirectIfAuthenticated>
  );
}
