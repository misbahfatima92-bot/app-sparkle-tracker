import { useState, useEffect } from "react";
import { Plus, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase, useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { combineDateTime, extractDateTimeFromText } from "@/lib/datetime";
import type { AppRow } from "@/lib/sheets";

type Mode = "add" | "edit";

type Props = {
  mode?: Mode;
  row?: AppRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

export function AddApplicationPanel({
  mode = "add",
  row,
  open: openProp,
  onOpenChange,
  hideTrigger = false,
}: Props = {}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setOpenState(v);
  };

  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const initialDate = row?.interview_date ?? "";
  const initialTime = row?.interview_time ?? "";

  const [company, setCompany] = useState(row?.company ?? "");
  const [role, setRole] = useState(row?.role ?? "");
  const [status, setStatus] = useState(row?.category?.toLowerCase() || "applied");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [notes, setNotes] = useState(row?.summary ?? "");
  const [action, setAction] = useState(/yes|true|1/i.test(row?.action_required ?? ""));

  useEffect(() => {
    if (open && row) {
      setCompany(row.company ?? "");
      setRole(row.role ?? "");
      setStatus(row.category?.toLowerCase() || "applied");
      setDate(row.interview_date ?? "");
      setTime(row.interview_time ?? "");
      setNotes(row.summary ?? "");
      setAction(/yes|true|1/i.test(row.action_required ?? ""));
    }
  }, [open, row]);

  function autoExtract() {
    const { date: d, time: t } = extractDateTimeFromText(notes);
    if (d) setDate(d);
    if (t) setTime(t);
    if (d || t) toast.success("Extracted date/time from notes");
    else toast("No date/time found in notes");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user?.id) {
      toast.error("You must be signed in.");
      return;
    }
    setSubmitting(true);
    try {
      const interview_date = date ? combineDateTime(date, time) : null;
      const payload: Record<string, any> = {
        company,
        role,
        status,
        interview_date,
        action_required: action ? "yes" : "no",
        ai_summary: notes,
      };

      if (mode === "edit" && row?.id) {
        const { error } = await supabase
          .from("applications")
          .update(payload)
          .eq("id", row.id)
          .eq("user_id", user.id);
        if (error) throw error;
        toast.success("✅ Application updated!");
      } else {
        const { error } = await supabase
          .from("applications")
          .insert({ ...payload, user_id: user.id });
        if (error) throw error;
        toast.success("✅ Application added!");
      }
      queryClient.invalidateQueries({ queryKey: ["applications", user.id] });
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={() => setOpen(true)}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-5px_rgba(124,58,237,0.6)] transition-all hover:shadow-[0_12px_40px_-5px_rgba(124,58,237,0.8)] hover:-translate-y-0.5"
        >
          {mode === "edit" ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {mode === "edit" ? "Edit" : "Add Application"}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-up"
            onClick={() => setOpen(false)}
            style={{ animationDuration: "0.2s" }}
          />
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-[#0a0a14]/95 backdrop-blur-2xl p-6 overflow-y-auto"
            style={{ animation: "slideInRight 0.35s cubic-bezier(0.4,0,0.2,1)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {mode === "edit" ? "Edit Application" : "New Application"}
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Company name">
                <input required value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Role">
                <input required value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                  <option value="applied">🟣 Applied</option>
                  <option value="interview">🟢 Interview</option>
                  <option value="offer">🏆 Offer</option>
                  <option value="rejected">🔴 Rejected</option>
                  <option value="follow_up">🟠 Follow up</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Interview Date">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`${inputCls} dark-picker`}
                  />
                </Field>
                <Field label="Interview Time">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`${inputCls} dark-picker`}
                  />
                </Field>
              </div>
              <Field label="Notes / Email body">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className={inputCls}
                />
              </Field>
              <button
                type="button"
                onClick={autoExtract}
                className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
              >
                ✨ Auto-extract date & time from notes
              </button>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={action}
                  onChange={(e) => setAction(e.target.checked)}
                  className="accent-violet-500 h-4 w-4"
                />
                <span className="text-sm">Action required</span>
              </label>
              <button
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-sm font-semibold shadow-[0_10px_40px_-10px_rgba(124,58,237,0.7)] hover:shadow-[0_14px_50px_-10px_rgba(124,58,237,0.9)] transition-shadow disabled:opacity-60"
              >
                {submitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Application"}
              </button>
            </form>
          </aside>
          <style>{`
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            .dark-picker::-webkit-calendar-picker-indicator { filter: invert(1) brightness(1.4); cursor: pointer; opacity: 0.7; }
            .dark-picker::-webkit-calendar-picker-indicator:hover { opacity: 1; }
            .dark-picker { color-scheme: dark; }
          `}</style>
        </div>
      )}
    </>
  );
}

const inputCls =
  "peer w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3.5 py-2.5 text-sm placeholder-transparent focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
