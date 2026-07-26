export function StatRow({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <div className="grid gap-6 border-y border-[var(--line)] py-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-sm tracking-[0.14em] text-[var(--slate)] uppercase">
            {item.label}
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
