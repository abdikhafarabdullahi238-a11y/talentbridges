import { createFileRoute } from "@tanstack/react-router";
import { CandidatesPage } from "@/components/talentbridge/employer";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/candidates")({
  head: () => pageHead("Discover Talent", "Your TalentBridge career workspace."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: CandidatesPage,
});
