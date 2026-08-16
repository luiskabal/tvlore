export type AppTab = "library" | "paths" | "profile" | "search";

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

  if (pathname === "/search" || pathname === "/recommendations" || pathname === "/popular") {
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
