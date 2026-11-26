import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/talentbridge/profile-page";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/profile")({
  head: () => pageHead("Professional Profile", "Your TalentBridge career workspace."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: ProfilePage,
});
