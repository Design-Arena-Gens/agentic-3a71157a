# Attedly – Multi-Tenant Kiosk Attendance SaaS

This repository houses the Supabase-backed implementation of **Attedly**, a contactless kiosk attendance platform with on-device liveness checks, face embedding storage via pgvector, and a web-based analytics suite.

## Project Layout

- `kiosk_app/` – Flutter tablet application for tenant onboarding, secure enrollment, liveness validation, and check-in loops with offline vector caching.
- `dashboard/` – Next.js 14 + Tailwind CSS admin portal featuring Supabase Auth, live Realtime feed, and SQL-powered analytics.
- `supabase/` – Database schema, pgvector-enabled functions, row-level security policies, and the `match-employee` Edge Function.

## Supabase Setup

```bash
supabase start
supabase migration up
supabase functions deploy match-employee
```

Configure edge function secrets with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The migration enables the `vector` extension, creates core tables, analytic views, RLS policies, and RPCs for matching and reporting.

## Dashboard (Next.js)

```bash
cd dashboard
cp .env.example .env.local   # populate Supabase URL + anon key
npm install
npm run dev
```

`npm run build` succeeds when Supabase environment variables are provided (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). The dashboard renders dynamically (cookies required) and surfaces:

- Metric cards fed by `attendance_summary_view`
- `LiveFeedTable` subscribing to `attendance_feed_view`
- D3 trend charts via `attendance_trend_series`
- Peak hour heatmap + late arrival alerts (SQL RPCs)

## Flutter Kiosk

```bash
cd kiosk_app
flutter pub get
flutter run --dart-define=SUPABASE_URL=https://... \
  --dart-define=SUPABASE_SERVICE_ROLE=...
```

Prerequisites:

- Add the MobileFaceNet model to `assets/models/mobilefacenet.tflite`.
- Ensure Android project scaffolding (`flutter create`) is initialized if absent.
- Grant camera/biometric permissions in `AndroidManifest.xml`.

Core features:

- Tenant linking with API key persistence
- Manager gateway with enrollment mode sheets
- Google ML Kit face + blink/smile heuristics for liveness
- TFLite embeddings, pgvector storage, local SQLite cache for offline speed
- Supabase Realtime push of `attendance_logs`

## Validation

- `npm run build` executed successfully with placeholder Supabase env vars.
- Node audit reports upstream advisories (`npm audit`); review before production.
- Flutter build/tests not run in this environment—set up Android tooling locally.

## Deployment

1. Apply Supabase migrations and policies.
2. Deploy `match-employee` edge function.
3. `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-3a71157a` for the dashboard.
4. Publish the Flutter kiosk APK and provision tablets via Android DeviceAdmin.
