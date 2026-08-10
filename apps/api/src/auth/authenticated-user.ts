export type AuthenticatedUser = {
  email: string | null;
  id: string;
  metadata: Record<string, unknown>;
};
