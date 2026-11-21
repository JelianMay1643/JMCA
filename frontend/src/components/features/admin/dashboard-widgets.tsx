import type { ReactNode } from "react";
import { statusColors } from "../../../lib/order-status";

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="truncate text-2xl font-bold text-magenta">{value}</p>
        {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
      </div>
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blush text-magenta">
        {icon}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
        statusColors[status] ?? "bg-neutral-100 text-neutral-800"
      }`}
    >
      {status}
    </span>
  );
}

type Bar = { label: string; value: number; tooltip: string };


export function BarChart({ data }: { data: Bar[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const labelEvery = data.length > 10 ? 5 : 1;

  return (
    <div className="flex h-52 items-stretch gap-1">
      {data.map((d, i) => (
        <div
          key={`${d.label}-${i}`}
          className="flex min-w-0 flex-1 flex-col"
          title={d.tooltip}
        >
          <div className="flex flex-1 items-end">
            <div
              className="w-full rounded-t bg-brand hover:bg-magenta"
              style={{
                height: `${d.value > 0 ? Math.max((d.value / max) * 100, 3) : 1}%`,
              }}
            />
          </div>
          <span className="mt-1 h-4 whitespace-nowrap text-center text-[10px] text-neutral-500">
            {i % labelEvery === 0 ? d.label : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

type Item = { label: string; value: number; display: string };


export function HBarList({ items, empty }: { items: Item[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">{empty}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex justify-between gap-2 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="flex-none font-bold text-magenta">
              {item.display}
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-200">
            <div
              className="h-2 rounded-full bg-brand"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}