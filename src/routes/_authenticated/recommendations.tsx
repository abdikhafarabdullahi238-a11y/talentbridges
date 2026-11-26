import { createFileRoute } from "@tanstack/react-router";
import { RecommendationsPage } from "@/components/talentbridge/discovery";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/recommendations")({
  head: () => pageHead("Career Matches", "Your TalentBridge career workspace."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: RecommendationsPage,
});
