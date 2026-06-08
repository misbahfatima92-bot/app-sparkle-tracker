import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApplications } from "./sheets";
import { useAuth } from "./auth";
import { supabase } from "./auth";

export function useApplications() {
  const { user, ready } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["applications", user?.id ?? "anon"];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchApplications(user?.id),
    enabled: ready && !!user?.id,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 15_000,
    staleTime: 0,
    gcTime: 0,
  });


  useEffect(() => {
    const channel = supabase
      .channel("applications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        (payload) => {
          console.log("[realtime] applications change:", payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return query;
}
