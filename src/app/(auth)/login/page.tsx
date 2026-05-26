import { RedirectIfAuthenticated } from "@/components/auth/route-guard";
import { LoginPage } from "@/components/pages/login";

export default function Page() {
  return (
    <RedirectIfAuthenticated>
      <LoginPage />
    </RedirectIfAuthenticated>
  );
}