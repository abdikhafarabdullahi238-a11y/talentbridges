import { queryOptions } from "@tanstack/react-query";
import { getCatalog, getWorkspace } from "./talentbridge.functions";
export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 60000,
});
export const workspaceQuery = queryOptions({
  queryKey: ["workspace"],
  queryFn: () => getWorkspace(),
  staleTime: 10000,
});
export type Workspace = Awaited<ReturnType<typeof getWorkspace>>;
export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
