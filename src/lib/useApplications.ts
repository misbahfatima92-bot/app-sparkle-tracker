import { useQuery } from "@tanstack/react-query";
import { fetchApplications } from "./sheets";
import { useAuth } from "./auth";

export function useApplications() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["applications", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("Not authenticated");
      return fetchApplications(user.id);
    },
    enabled: true,
queryFn: () => fetchApplications('9b77f78f-f07d-41ac-95bc-1be46a0dffd2'),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
