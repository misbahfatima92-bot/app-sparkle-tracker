import { createFileRoute } from "@tanstack/react-router";
import { useApplications } from "@/lib/useApplications";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { AddApplicationPanel } from "@/components/AddApplicationPanel";

export const Route = createFileRoute("/applications")({
  component: AppsPage,
  head: () => ({ meta: [{ title: "Applications — JobTrack" }] }),
});

function AppsPage() {
  const { data: rows = [] } = useApplications();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Applications</h1>
          <p className="text-sm text-slate-400 mt-1">{rows.length} total applications tracked.</p>
        </div>
        <AddApplicationPanel />
      </div>
      <ApplicationsTable rows={rows} />
    </div>
  );
}
