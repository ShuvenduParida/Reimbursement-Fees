import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./DocumentManagement.module.css";
import { Toolbar, DataTable, Breadcrumbs, DetailField } from "./ProcessList";

import {
    getProcessList,
    getProcessActivityList
} from "../../services/productServices";

export default function ProcessDetails({ onBack, onOpenDocuments, onOpenEmailTemplate }) {
  const { processId } = useParams();
  const location = useLocation();

  // The process object is passed via navigation state when the user comes
  // from the Process List (fast path, no refetch). If it's missing — e.g.
  // a direct link or a page refresh — fall back to the full list and find
  // the matching row, since there is no "get single process" endpoint.
  const [process, setProcess] = useState(location.state?.process || null);
  const [activityList, setActivityList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (process) return;
    getProcessList()
      .then((res) => {
        const match = (res.data || []).find(
          (p) => String(p.process_id) === String(processId)
        );
        if (match) setProcess(match);
      })
      .catch((err) => console.log(err));
  }, [process, processId]);

  const loadActivityList = () => {
    setLoading(true);
    getProcessActivityList({process_id: processId})
      .then((res) => {
        setActivityList(res.data || []);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActivityList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId]);

  const rows = useMemo(
    () =>
      activityList.filter((a) =>
        (a.activity_name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [search, activityList]
  );

  const resolvedProcess = process || { process_id: processId };

  const columns = [
    { key: "activity_name", label: "Activity Name" },
    { key: "activity_id", label: "Activity ID" },
    { key: "planned_days", label: "Planned Days" },
    { key: "dependent_activity", label: "Dependent Activity" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => onOpenDocuments(resolvedProcess, row)}
          >
            Documents
          </button>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => onOpenEmailTemplate && onOpenEmailTemplate(resolvedProcess, row)}
          >
            Email Template
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Process List", onClick: onBack },
          { label: process?.process_name || `Process ${processId}` },
        ]}
      />

      <div className={styles.tabsContainer} style={{ marginBottom: 18, padding: "16px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 20,
          }}
        >
          <DetailField label="Process Name" value={process?.process_name} />
          <DetailField label="Process ID" value={process?.process_id || processId} />
          <DetailField label="Process Type" value={process?.process_type} />
          <DetailField label="Planned Days" value={process?.planned_days} />
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search activities..."
        onRefresh={loadActivityList}
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id ?? row.activity_id}
        emptyMessage={loading ? "Loading activities..." : "No activities found."}
      />
    </div>
  );
}
