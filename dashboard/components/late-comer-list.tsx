type LateComer = {
  employee_name: string;
  first_seen: string;
  minutes_late: number;
};

export function LateComerList({ items }: { items: LateComer[] }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <h3 className="font-semibold uppercase tracking-wide text-amber-200">
        Late Arrivals
      </h3>
      <div className="mt-4 space-y-3 text-sm text-amber-100">
        {items.map((item) => (
          <div
            key={item.employee_name + item.first_seen}
            className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2"
          >
            <div className="font-medium">{item.employee_name}</div>
            <div className="text-xs text-amber-200/70">
              {item.minutes_late} min late
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-xl bg-black/30 px-3 py-2 text-center text-xs uppercase tracking-wide text-amber-200/50">
            No late arrivals today
          </div>
        )}
      </div>
    </div>
  );
}
