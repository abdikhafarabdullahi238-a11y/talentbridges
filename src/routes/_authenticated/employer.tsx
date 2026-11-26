import { createFileRoute } from "@tanstack/react-router";
import { EmployerPage } from "@/components/talentbridge/employer";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/employer")({
  head: () => pageHead("Employer Dashboard", "Your TalentBridge career workspace."),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  component: EmployerPage,
});
