import { createFileRoute } from "@tanstack/react-router";
import { DiscoveryPage } from "@/components/talentbridge/discovery";
import { catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/opportunities")({
  head: () => pageHead("Opportunities", "Discover inclusive jobs and internships."),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: () => <DiscoveryPage kind="jobs" />,
});
