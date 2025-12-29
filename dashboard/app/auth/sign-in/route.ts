"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/");
}
