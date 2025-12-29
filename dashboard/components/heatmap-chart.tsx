 "use client";

type HeatmapProps = {
  data: {
    hour: number;
    count: number;
  }[];
};

export function HeatmapChart({ data }: HeatmapProps) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div className="grid grid-cols-6 gap-2">
      {data.map((cell) => {
        const intensity = cell.count / max;
        const alpha = Math.max(intensity * 0.85, 0.08);
        return (
          <div
            key={cell.hour}
            className="rounded-lg border border-white/5 p-3 text-center text-xs text-white/70"
            style={{ backgroundColor: `rgba(37,99,235,${alpha})` }}
          >
            <div className="text-white/60">{`${cell.hour}:00`}</div>
            <div className="mt-1 text-lg font-semibold text-white">{cell.count}</div>
          </div>
        );
      })}
    </div>
  );
}
