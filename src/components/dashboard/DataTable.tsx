export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto border border-[var(--line)]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--s3)] text-[var(--w)]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-[var(--g1)]"
              >
                Sin registros todavía.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={`${row[0]}-${index}`}
                className="border-t border-[var(--line)] bg-[var(--s1)]/70"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${index}-${cellIndex}`}
                    className="px-4 py-3 text-[var(--w2)]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
