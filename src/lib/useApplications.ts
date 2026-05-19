import { useQuery } from "@tanstack/react-query";
import { fetchSheet } from "./sheets";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: fetchSheet,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
