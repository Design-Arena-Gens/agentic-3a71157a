 "use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

type FeedRow = {
  id: string;
  employee_name: string;
  status: string;
  timestamp: string;
  department: string | null;
};

const supabase = createClientComponentClient();

export function LiveFeedClient({
  orgId,
  initial,
}: {
  orgId: string;
  initial: FeedRow[];
}) {
  const [rows, setRows] = useState<FeedRow[]>(initial);

  useEffect(() => {
    const channel = supabase
      .channel(`attendance-feed-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_feed_view",
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          setRows((current) => [
            payload.new as FeedRow,
            ...current.slice(0, 49),
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-white/[0.03] text-left uppercase tracking-wide text-white/50">
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/5 text-white">
              <td className="px-4 py-3 font-medium">{row.employee_name}</td>
              <td className="px-4 py-3 text-white/70">
                {row.department ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-green-400">
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-white/60">
                {formatDistanceToNow(new Date(row.timestamp), {
                  addSuffix: true,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
