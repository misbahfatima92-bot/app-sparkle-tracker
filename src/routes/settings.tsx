import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Bell, User, Database, Mail, Loader2, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { useAuth, supabase } from "@/lib/auth";
import { syncGmail } from "@/lib/gmail";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — JobTrack" }] }),
});

function SettingsPage() {
  const { user, loginWithGoogle } = useAuth();
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Report time states
  const [reportTime, setReportTime] = useState("11:00");
  const [savingTime, setSavingTime] = useState(false);
  const [timeSaved, setTimeSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Gmail connection check
    supabase
      .from("users")
      .select("gmail_connected")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: any) => setConnected(!!data?.gmail_connected));

    // Load saved report time
    supabase
      .from("user_settings")
      .select("preferred_hour, preferred_minute")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          const h = String(data.preferred_hour).padStart(2, "0");
          const m = String(data.preferred_minute).padStart(2, "0");
          setReportTime(`${h}:${m}`);
        }
      });
  }, [user]);

  const connect = async () => {
    try {
      await loginWithGoogle();
    } catch (e: any) {
      toast.error(e.message ?? "Connect failed");
    }
  };

  const sync = async () => {
    if (!user) return;
    setSyncing(true);
    setLastResult(null);
    try {
      const r = await syncGmail(user.id);
      setLastResult(`Synced ${r.total} email${r.total === 1 ? "" : "s"} · ${r.added} new`);
      toast.success(`Imported ${r.added} new application${r.added === 1 ? "" : "s"}`);
      setConnected(true);
      qc.invalidateQueries({ queryKey: ["applications"] });
    } catch (e: any) {
      if (e.message === "no_gmail_token" || e.message === "gmail_unauthorized") {
        toast.error("Gmail access expired. Please reconnect.");
        setConnected(false);
      } else {
        toast.error(e.message ?? "Sync failed");
      }
    } finally {
      setSyncing(false);
    }
  };

  const saveReportTime = async () => {
    if (!user) return;
    setSavingTime(true);
    setTimeSaved(false);
    try {
      const [hourStr, minuteStr] = reportTime.split(":");
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            preferred_hour: parseInt(hourStr),
            preferred_minute: parseInt(minuteStr),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      setTimeSaved(true);
      toast.success("✅ Report time saved!");
      setTimeout(() => setTimeSaved(false), 3000);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save time");
    } finally {
      setSavingTime(false);
    }
  };

  const formatDisplayTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure your workspace.</p>
      </div>

      {/* Gmail Section - unchanged */}
      <div className="glass p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-rose-300">
            <Mail className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">Gmail</h3>
              {connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> CONNECTED
                </span>
              ) : (
                <span className="rounded-full bg-slate-500/15 border border-slate-500/30 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                  NOT CONNECTED
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Connect your Gmail to automatically import job application emails (last 90 days) into your tracker.
            </p>
            {lastResult && <p className="text-xs text-slate-500 mt-2">{lastResult}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {!connected && (
                <button
                  onClick={connect}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  Connect Gmail
                </button>
              )}
              <button
                onClick={sync}
                disabled={syncing}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 disabled:opacity-60"
              >
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {syncing ? "Syncing…" : connected ? "Sync now" : "Connect & sync"}
              </button>
              {connected && (
                <button
                  onClick={connect}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Report Time Section - NEW */}
      <div className="glass p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-amber-300">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Daily Report Time</h3>
            <p className="text-sm text-slate-400 mt-1">
              Choose what time you want to receive your daily job tracker summary email.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="time"
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-400">
                = {formatDisplayTime(reportTime)}
              </span>
              <button
                onClick={saveReportTime}
                disabled={savingTime}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {savingTime ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : timeSaved ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {savingTime ? "Saving…" : timeSaved ? "Saved!" : "Save Time"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              🤖 n8n will automatically send your report at this time every day.
            </p>
          </div>
        </div>
      </div>

      {/* Cards - unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card icon={User} title="Profile" desc={user?.email ?? ""} />
        <Card icon={Database} title="Google Sheets Sync" desc="Connected · auto-refresh every 30s" badge="LIVE" />
        <Card icon={Zap} title="n8n Automation" desc="Workflow active · v2.1.0" badge="ON" />
        <Card icon={Bell} title="Notifications" desc="Interview reminders enabled" />
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, desc, badge }: any) {
  return (
    <div className="glass glass-hover p-5 flex items-start gap-4">
      <div className="rounded-xl bg-violet-500/15 border border-violet-500/30 p-2.5 text-violet-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          {badge && (
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}
