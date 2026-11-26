import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/talentbridge/community";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => pageHead("Notifications", "Your TalentBridge career workspace."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: NotificationsPage,
});
