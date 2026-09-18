"use client";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  onSurface = false,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  onSurface?: boolean;
}) {
  return (
    <div
      className={`flex w-full gap-1 rounded-full p-1 ${
        onSurface
          ? "bg-white/90 shadow-[0_2px_8px_rgba(10,10,10,0.1)]"
          : "bg-canvas"
      }`}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`flex-1 rounded-full py-2.5 text-[13px] font-medium ${
              active
                ? "bg-ink text-white shadow-pill"
                : onSurface
                  ? "text-muted"
                  : "bg-surface text-ink shadow-pill"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
