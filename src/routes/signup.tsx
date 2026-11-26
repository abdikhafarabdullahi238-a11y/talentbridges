import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/talentbridge/auth-page";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { role?: string } =>
    typeof search["role"] === "string" ? { role: search["role"] } : {},
  head: () =>
    pageHead("Join TalentBridge", "Create your professional, mentor or employer account."),
  component: Signup,
});
function Signup() {
  const { role } = Route.useSearch();
  return <AuthPage signup initialRole={role ?? "professional"} />;
}
