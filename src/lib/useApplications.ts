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
    if (!user?.id) return;
    const channel = supabase
      .channel(`applications-changes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "applications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[realtime] INSERT applications:", payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[realtime] UPDATE applications:", payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "applications" },
        (payload) => {
          console.log("[realtime] DELETE applications:", payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        console.log("[realtime] subscription status:", status);
      });
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return query;
}
