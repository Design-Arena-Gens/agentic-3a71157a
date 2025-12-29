import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.08] p-8 shadow-xl shadow-black/30">
        <h1 className="text-2xl font-bold">Attedly Dashboard</h1>
        <p className="mt-2 text-sm text-white/60">
          Sign in with your Supabase dashboard credentials.
        </p>
        <form
          className="mt-6 space-y-4"
          action="/auth/sign-in"
          method="post"
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-0"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-0"
          />
          <button className="w-full rounded-full bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/80">
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
