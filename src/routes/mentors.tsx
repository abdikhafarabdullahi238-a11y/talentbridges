import { createFileRoute } from "@tanstack/react-router";
import { DiscoveryPage } from "@/components/talentbridge/discovery";
import { catalogQuery } from "@/lib/queries";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/mentors")({
  head: () => pageHead("MentorConnect", "Discover professional mentors who support your career."),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: () => <DiscoveryPage kind="mentors" />,
});
