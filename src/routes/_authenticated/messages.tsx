import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/talentbridge/community";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/messages")({
  validateSearch: (s: Record<string, unknown>): { contact?: string } =>
    typeof s["contact"] === "string" ? { contact: s["contact"] } : {},
  head: () => pageHead("Messages", "Your private professional conversations on TalentBridge."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: Messages,
});
function Messages() {
  const { contact } = Route.useSearch();
  return <MessagesPage {...(contact ? { initialContact: contact } : {})} />;
}
