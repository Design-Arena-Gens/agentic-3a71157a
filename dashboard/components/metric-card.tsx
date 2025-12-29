type Props = {
  title: string;
  value: string | number;
  helper?: string;
};

export function MetricCard({ title, value, helper }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-black/20">
      <div className="text-sm uppercase tracking-wide text-white/60">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {helper ? <div className="mt-1 text-xs text-white/50">{helper}</div> : null}
    </div>
  );
}
