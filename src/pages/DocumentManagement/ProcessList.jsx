import React, { useEffect, useMemo, useState } from "react";
import styles from "./DocumentManagement.module.css";
// import { getProcessList } from "../services/productServices";
import { getProcessList } from "../../services/productServices";

/* ------------------------------------------------------------------ */
/* Shared UI atoms                                                     */
/* ------------------------------------------------------------------ */
/* These are reused by ProcessDetails, ActivityDocuments and            */
/* SelectDocumentModal. They live here (instead of a 7th file) so the   */
/* module stays to exactly the files requested, and every page imports  */
/* them from "./ProcessList" — no circular imports, since ProcessList   */
/* itself does not import any of the other pages.                       */
/* ------------------------------------------------------------------ */

export const ICONS = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M20 11A8 8 0 1 0 18.5 16M20 5v6h-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onRefresh,
  onAdd,
  addLabel,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon} aria-hidden="true">
          {ICONS.search}
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.toolbarActions}>
        {onRefresh && (
          <button type="button" className={styles.iconButton} onClick={onRefresh}>
            <span aria-hidden="true">{ICONS.refresh}</span>
            Refresh
          </button>
        )}
        {onAdd && (
          <button type="button" className={styles.primaryButton} onClick={onAdd}>
            <span aria-hidden="true">{ICONS.plus}</span>
            {addLabel || "Add"}
          </button>
        )}
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, emptyMessage, rowKey }) {
  const getKey = rowKey || ((row, index) => (row && row.id != null ? row.id : index));

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyState}>
                {emptyMessage || "No records found."}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getKey(row, index)}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* Breadcrumbs: items = [{ label, onClick? }]. Last item (or any item      */
/* without onClick) renders as plain text instead of a link.               */
export function Breadcrumbs({ items }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}
    >
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && (
            <span style={{ display: "flex", color: "#9aa1ae" }} aria-hidden="true">
              {ICONS.chevronRight}
            </span>
          )}
          {item.onClick ? (
            <button type="button" className={styles.linkButton} onClick={item.onClick}>
              {item.label}
            </button>
          ) : (
            <span className={styles.summaryDescription}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* Simple label / value pair, used in the Process Detail summary card. */
export function DetailField({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span className={styles.summaryDescription}>{label}</span>
      <span className={styles.summaryTitle}>{value === undefined || value === null || value === "" ? "—" : value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Process List page                                                   */
/* ------------------------------------------------------------------ */

export default function ProcessList({ onView }) {
  const [search, setSearch] = useState("");
  const [processList, setProcessList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProcessList = () => {
    setLoading(true);
    getProcessList()
      .then((res) => {
        setProcessList(res.data || []);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProcessList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(
    () =>
      processList.filter((p) =>
        (p.process_name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [search, processList]
  );

  const columns = [
    { key: "process_name", label: "Process Name" },
    { key: "process_id", label: "Process ID" },
    { key: "planned_days", label: "Planned Days" },
    { key: "process_type", label: "Process Type" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className={styles.rowActions}>
          <button type="button" className={styles.linkButton} onClick={() => onView(row)}>
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search processes..."
        onRefresh={loadProcessList}
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.process_id}
        emptyMessage={loading ? "Loading processes..." : "No processes found."}
      />
    </div>
  );
}
