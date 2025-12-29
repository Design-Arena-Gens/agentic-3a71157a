import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { LiveFeedClient } from "./live-feed.client";

async function loadInitialFeed() {
  const supabase = createServerComponentClient({
    cookies,
  });
  const { data } = await supabase
    .from("attendance_feed_view")
    .select("*")
    .limit(20)
    .order("timestamp", { ascending: false });
  return data ?? [];
}

export async function LiveFeedTable({ orgId }: { orgId: string }) {
  const initial = await loadInitialFeed();
  return (
    <Suspense fallback={<div className="p-6 text-white/60">Loading feed…</div>}>
      <LiveFeedClient orgId={orgId} initial={initial} />
    </Suspense>
  );
}
