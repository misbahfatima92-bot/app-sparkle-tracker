import { useQuery } from "@tanstack/react-query";
import { fetchApplications } from "./sheets";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: () => fetchApplications("9b77f78f-f07d-41ac-95bc-1be46a0dffd2"),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
