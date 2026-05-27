import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/** Main sidebar navigation — never keep an old #section hash on the target page. */
export function navigateMainNav(
  router: AppRouterInstance,
  pathname: string,
  href: string,
): void {
  const base = href.split("#")[0];
  const onSamePage =
    pathname === base || (base !== "/" && pathname.startsWith(`${base}/`));

  if (onSamePage) {
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", base);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  router.push(base);
}
