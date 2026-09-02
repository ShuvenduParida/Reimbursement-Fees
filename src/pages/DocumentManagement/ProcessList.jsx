import React, { useEffect, useMemo, useState } from "react";
import styles from "./DocumentManagement.module.css";
import { FaSearch, FaSyncAlt, FaPlus, } from "react-icons/fa";
import { getProcessList } from "../../services/productServices";



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
          <FaSearch size={14} />
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
            <span aria-hidden="true"><FaSyncAlt size={14} /></span>
            Refresh
          </button>
        )}
        {onAdd && (
          <button type="button" className={styles.primaryButton} onClick={onAdd}>
            <span aria-hidden="true"><FaPlus size={14} /></span>
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
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && (
            <span className={styles.breadcrumbSeparator}>
              &gt;
            </span>
          )}

          {item.onClick ? (
            <button
              type="button"
              className={styles.breadcrumbLink}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ) : (
            <span
            className={
              index === items.length - 1
                ? styles.breadcrumbActive
                : styles.breadcrumbCurrent
            }
          >
            {item.label}
          </span>
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

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

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
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredRows = useMemo(() => {
    return processList.filter((p) =>
      (p.process_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, processList]);

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);

  const rows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

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
      <div className={styles.pagination}>
      <button
        className={styles.pageButton}
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => p - 1)}
      >
        ← Previous
      </button>

      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages || 1}
      </span>

      <button
        className={styles.pageButton}
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => setCurrentPage((p) => p + 1)}
      >
        Next →
      </button>
    </div>
    </div>
  );
}
