import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

type Payload = {
  org_id: string;
  vector: number[];
  liveness_score?: number;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as Payload;
    if (!payload?.org_id || !payload?.vector) {
      return new Response(
        JSON.stringify({ error: "org_id and vector required" }),
        { status: 400 }
      );
    }
    const { data, error } = await supabase.rpc("match_employee_embedding", {
      org_id: payload.org_id,
      input_vector: payload.vector,
    });
    if (error) {
      throw error;
    }
    if (!data?.length) {
      return new Response(JSON.stringify({ match: null }), { status: 200 });
    }
    const best = data[0];
    return new Response(JSON.stringify({ match: best }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "match failed", details: `${error}` }),
      { status: 500 }
    );
  }
});
