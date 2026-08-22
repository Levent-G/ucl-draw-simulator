import React, { useMemo, useState } from "react";

// Genel amaçlı, tıklanan başlığa göre sıralanan tablo. columns: [{ key, label,
// accessor?, sortAccessor?, render? }]. accessor/sortAccessor verilmezse
// row[key] kullanılır.
export default function SortableTable({ columns, rows, defaultSortKey, defaultDir = "desc", rowKey }) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [dir, setDir] = useState(defaultDir);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const accessor = col.sortAccessor || col.accessor || ((r) => r[col.key]);
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (typeof av === "string" || typeof bv === "string") {
        const cmp = String(av ?? "").localeCompare(String(bv ?? ""), "tr");
        return dir === "asc" ? cmp : -cmp;
      }
      const an = Number(av) || 0;
      const bn = Number(bv) || 0;
      return dir === "asc" ? an - bn : bn - an;
    });
    return copy;
  }, [rows, sortKey, dir, columns]);

  const handleSort = (key) => {
    if (key === sortKey) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("desc");
    }
  };

  return (
    <div className="sortable-table-scroll" tabIndex={0} role="region" aria-label="Sıralanabilir tablo">
      <table className="sortable-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                aria-sort={sortKey === c.key ? (dir === "asc" ? "ascending" : "descending") : "none"}
                className={sortKey === c.key ? "sorted" : ""}
              >
                <button type="button" className="sortable-th-btn" onClick={() => handleSort(c.key)}>
                  {c.label}
                  {sortKey === c.key && (
                    <span className="sort-arrow">{dir === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
