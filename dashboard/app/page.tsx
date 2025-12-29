import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { MetricCard } from "../components/metric-card";
import { LateComerList } from "../components/late-comer-list";
import { AttendanceTrend } from "../components/attendance-trend";
import { HeatmapChart } from "../components/heatmap-chart";
import { LiveFeedTable } from "../components/live-feed-table";
import { Building2, Clock, LogOut } from "lucide-react";

async function getDashboardData() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }
  const orgId =
    (session.user.app_metadata.organization_id as string | undefined) ??
    (session.user.user_metadata?.org_id as string | undefined);
  if (!orgId) {
    redirect("/login");
  }

  const [
    attendanceSummary,
    trendSeries,
    heatmap,
    lateComers,
    tenant,
  ] = await Promise.all([
    supabase
      .from("attendance_summary_view")
      .select("*")
      .eq("org_id", orgId)
      .single(),
    supabase.rpc("attendance_trend_series", { org_id: orgId }),
    supabase.rpc("peak_hour_heatmap", { org_id: orgId }),
    supabase.rpc("late_comer_alerts", { org_id: orgId }),
    supabase.from("organizations").select("name").eq("id", orgId).single(),
  ]);

  return {
    orgId,
    tenantName: tenant.data?.name ?? "Organization",
    summary: attendanceSummary.data ?? {
      on_time_rate: 0,
      total_check_ins: 0,
      active_employees: 0,
    },
    trendSeries: (trendSeries.data as any[])?.map((row) => ({
      label: row.label as string,
      percentage: Number(row.percentage),
    })) ?? [],
    heatmap:
      (heatmap.data as any[])?.map((row) => ({
        hour: Number(row.hour),
        count: Number(row.count),
      })) ?? [],
    lateComers:
      (lateComers.data as any[])?.map((row) => ({
        employee_name: row.employee_name as string,
        minutes_late: Number(row.minutes_late),
        first_seen: row.first_seen as string,
      })) ?? [],
  };
}

export default async function Page() {
  const data = await getDashboardData();
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Building2 className="h-4 w-4" />
            <span>{data.tenantName}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Attendance Command Center</h1>
        </div>

        <form action="/auth/sign-out" method="post">
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Check-ins" value={data.summary.total_check_ins ?? 0} />
        <MetricCard
          title="On-time ratio"
          value={`${Math.round(Number(data.summary.on_time_rate ?? 0) * 100)}%`}
        />
        <MetricCard
          title="Active employees"
          value={data.summary.active_employees ?? 0}
          helper="Employees enrolled with a face vector"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-white/60">
            <Clock className="h-4 w-4" /> Attendance trend
          </div>
          <AttendanceTrend data={data.trendSeries} />
        </div>
        <LateComerList items={data.lateComers} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveFeedTable orgId={data.orgId} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-sm uppercase tracking-wide text-white/60">Peak Hours</h3>
          <div className="mt-4">
            <HeatmapChart data={data.heatmap} />
          </div>
        </div>
      </section>
    </main>
  );
}
