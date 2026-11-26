import { createFileRoute } from "@tanstack/react-router";
import { MentorDashboard } from "@/components/talentbridge/community";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/mentor-dashboard")({
  head: () => pageHead("Mentor Dashboard", "Your TalentBridge career workspace."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: MentorDashboard,
});
