import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./DocumentManagement.module.css";
import { Toolbar, DataTable, Breadcrumbs, DetailField, ICONS } from "./ProcessList";
import SelectDocumentModal from "./SelectDocumentModal";
import { getProcessActivityList, getActivityDocumentList, addActivityDocument, updateActivityDocument } from "../../services/productServices";

let tempIdCounter = -1; // negative temp ids for newly added, unsaved rows

export default function ActivityDocuments({ onBackToList, onBack }) {
  const { processId, activityId } = useParams();
  const location = useLocation();

  const [process, setProcess] = useState(location.state?.process || null);
  const [activity, setActivity] = useState(location.state?.activity || null);

  const [documentList, setDocumentList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  // Fallback for direct links / refreshes where the activity object wasn't
  // passed through navigation state — there's no "get single activity"
  // endpoint, so re-fetch the activity list for this process and find it.
  useEffect(() => {
    if (activity) return;
    getProcessActivityList(processId)
      .then((res) => {
        const match = (res.data || []).find(
          (a) => String(a.activity_id) === String(activityId)
        );
        if (match) setActivity(match);
      })
      .catch((err) => console.log(err));
  }, [activity, processId, activityId]);

  const loadDocumentList = () => {
    setLoading(true);
    getActivityDocumentList({activity_id: activityId})
      .then((res) => {
        const withUiState = (res.data || []).map((row) => ({ ...row, _isEditing: false }));
        setDocumentList(withUiState);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocumentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const rows = useMemo(
    () =>
      documentList.filter((d) =>
        (d.document_data?.name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [search, documentList]
  );

  const updateRow = (id, patch) => {
    setDocumentList((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const handleRemoveRow = (id) => {
    setDocumentList((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSaveRow = async (id) => {

    const row = documentList.find(r => r.id === id);

    if (!row) return;

    try {

        if (row.id < 0) {

            // ADD
            const payload = {
                document_data: {
                    activity_id: Number(activityId),
                    call_mode: "ADD",
                    document_id: row.document_data.id,
                    is_mandatory: row.is_mandatory,
                    name: row.name
                }
            };

            await addActivityDocument(payload);

        } else {

            // UPDATE
            const payload = {
                document_data: {
                    activity_document_id: row.id,
                    activity_id: Number(activityId),
                    call_mode: "UPDATE",
                    document_id: row.document_data.id,
                    is_mandatory: row.is_mandatory,
                    name: row.name
                }
            };

            await updateActivityDocument(payload);

        }

        loadDocumentList();

    } catch (err) {

        console.log(err);

    }

  };

  const handleSelectDocument = (documentType) => {
    setModalOpen(false);
    const newRow = {
      id: tempIdCounter--,
      activity_id: Number(activityId),
      name: "",
      is_mandatory: false,
      document_data: documentType,
      _isEditing: true,
    };
    setDocumentList((prev) => [...prev, newRow]);
  };

  const resolvedProcess = process || { process_id: processId };

  const columns = [
    {
      key: "documentName",
      label: "Document Name",
      render: (row) => row.document_data?.name,
    },
    {
      key: "documentCode",
      label: "Document Code",
      render: (row) => row.document_data?.document_code,
    },
    {
      key: "allowedFileTypes",
      label: "Allowed File Types",
      render: (row) => (row.document_data?.allowed_file_type || []).join(", "),
    },
    {
      key: "sizeLimit",
      label: "Size Limit",
      render: (row) => row.document_data?.size_limit,
    },
    {
      key: "fieldName",
      label: "Field Name",
      render: (row) =>
        row._isEditing ? (
          <input
            type="text"
            className={styles.searchInput}
            style={{ width: 170 }}
            value={row.name}
            placeholder="Enter field name"
            onChange={(e) => updateRow(row.id, { name: e.target.value })}
          />
        ) : (
          row.name
        ),
    },
    {
      key: "mandatory",
      label: "Mandatory",
      render: (row) => (
        <input
          type="checkbox"
          checked={!!row.is_mandatory}
          disabled={!row._isEditing}
          onChange={(e) => updateRow(row.id, { is_mandatory: e.target.checked })}
        />
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className={styles.rowActions}>
          {row._isEditing ? (
            <>
              <button
                type="button"
                className={styles.linkButton}
                disabled={!row.name}
                onClick={() => handleSaveRow(row.id)}
              >
                Save
              </button>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => handleRemoveRow(row.id)}
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => updateRow(row.id, { _isEditing: true })}
              >
                Edit
              </button>
              {/* <button
                type="button"
                className={styles.linkButton}
                onClick={() => handleRemoveRow(row.id)}
              >
                Remove
              </button> */}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Process List", onClick: onBackToList },
          {
            label: process?.process_name || `Process ${processId}`,
            onClick: () => onBack(resolvedProcess),
          },
          { label: activity?.activity_name || `Activity ${activityId}` },
          { label: "Documents" },
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
          <DetailField label="Activity Name" value={activity?.activity_name} />
          <DetailField label="Activity ID" value={activity?.activity_id || activityId} />
          <DetailField label="Planned Days" value={activity?.planned_days} />
          <DetailField label="Dependent Activity" value={activity?.dependent_activity} />
        </div>
      </div>

      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search documents..."
        onRefresh={loadDocumentList}
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        emptyMessage={loading ? "Loading documents..." : "No documents added yet."}
      />

      <div style={{ marginTop: 14 }}>
        <button type="button" className={styles.primaryButton} onClick={() => setModalOpen(true)}>
          <span aria-hidden="true">{ICONS.plus}</span>
          Add Document
        </button>
      </div>

      {isModalOpen && (
        <SelectDocumentModal onClose={() => setModalOpen(false)} onSelect={handleSelectDocument} />
      )}
    </div>
  );
}
