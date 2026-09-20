export type AuthRedirectRuntime = "expo-go" | "native";

export function getAuthRedirectOptions(runtime: AuthRedirectRuntime) {
  if (runtime === "expo-go") {
    return {};
  }

  return {
    isTripleSlashed: true,
    scheme: "tvlore",
  } as const;
}
