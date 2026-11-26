import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/talentbridge/dashboard";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageHead("Professional Dashboard", "Your TalentBridge career workspace."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: Dashboard,
});
