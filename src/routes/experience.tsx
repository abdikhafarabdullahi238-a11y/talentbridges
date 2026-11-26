import { createFileRoute } from "@tanstack/react-router";
import { DiscoveryPage } from "@/components/talentbridge/discovery";
import { catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/experience")({
  head: () =>
    pageHead("Experience Hub", "Gain practical experience through projects and internships."),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: () => <DiscoveryPage kind="experience" />,
});
