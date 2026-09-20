export type AppTab = "library" | "paths" | "profile" | "search";
export type AuthRouteKind = "error" | "loading" | "signedIn" | "signedOut" | "unconfigured";

export const tabs: { href: "/library" | "/search" | "/paths" | "/profile"; key: AppTab; label: string }[] = [
  { href: "/library", key: "library", label: "Library" },
  { href: "/search", key: "search", label: "Search" },
  { href: "/paths", key: "paths", label: "Paths" },
  { href: "/profile", key: "profile", label: "Profile" },
];

const tabOrder = tabs.map((tab) => tab.key);

export function getActiveTab(pathname: string): AppTab | null {
  if (pathname === "/" || pathname === "/library") {
    return "library";
  }

  if (pathname === "/search" || pathname === "/recommendations" || pathname === "/popular" || pathname === "/picks" || pathname === "/available") {
    return "search";
  }

  if (pathname === "/paths") {
    return "paths";
  }

  if (pathname === "/profile") {
    return "profile";
  }

  return null;
}

export function getVisibleTab(pathname: string, previousTab: AppTab | null): AppTab | null {
  if (pathname === "/login" || pathname.startsWith("/auth/")) {
    return null;
  }

  return getActiveTab(pathname) ?? previousTab ?? "library";
}

export function getAuthRedirect(pathname: string, authKind: AuthRouteKind): "/library" | "/login" | null {
  if (authKind === "loading") {
    return null;
  }

  if (authKind === "signedIn" && (pathname === "/login" || pathname.startsWith("/auth/"))) {
    return "/library";
  }

  if (authKind !== "signedIn" && pathname !== "/login" && !pathname.startsWith("/auth/")) {
    return "/login";
  }

  return null;
}

export function getTabStackScreenOptions(previousTab: AppTab | null, nextTab: AppTab | null) {
  if (!previousTab || !nextTab || previousTab === nextTab) {
    return {};
  }

  const isForward = tabOrder.indexOf(nextTab) > tabOrder.indexOf(previousTab);

  return {
    animation: isForward ? "slide_from_right" : "slide_from_left",
    animationTypeForReplace: isForward ? "push" : "pop",
  } as const;
}
