import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/talentbridge/auth-page";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/auth")({
  head: () => pageHead("Log in", "Log in to your TalentBridge professional workspace."),
  component: () => <AuthPage />,
});
