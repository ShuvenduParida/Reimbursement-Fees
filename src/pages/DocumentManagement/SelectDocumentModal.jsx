import React, { useEffect, useState } from "react";
import styles from "./DocumentManagement.module.css";
import { DataTable } from "./ProcessList";
import { getDocumentTypeList } from "../../services/productServices";



const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};

const panelStyle = {
  width: "100%",
  maxWidth: 720,
  maxHeight: "80vh",
  overflow: "auto",
  padding: "20px 22px 22px",
};

export default function SelectDocumentModal({ onClose, onSelect }) {
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    getDocumentTypeList()
      .then((res) => {
        setDocumentTypeList(res.data || []);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredDocumentTypeList = documentTypeList.filter((doc) => {
  const search = searchTerm.toLowerCase();

  return (
    doc.name.toLowerCase().includes(search) ||
    doc.document_code.toLowerCase().includes(search)
  );
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "document_code", label: "Code" },
    {
      key: "allowed_file_type",
      label: "Allowed File Types",
      render: (row) => (row.allowed_file_type || []).join(", "),
    },
    { key: "size_limit", label: "Size Limit" },
    {
      key: "action",
      label: "",
      render: (row) => (
        <button type="button" className={styles.primaryButton} onClick={() => onSelect(row)}>
          Select
        </button>
      ),
    },
  ];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        className={styles.tabsContainer}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Select Document Type"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2 className={styles.title} style={{ fontSize: 17, margin: 0 }}>
            Select Document Type
          </h2>
          <button type="button" className={styles.linkButton} onClick={onClose}>
            Close
          </button>
        </div>
        <div className={styles.modalSearchContainer}>
        <input
          type="text"
          className={styles.modalSearchInput}
          placeholder="Search by document name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
         </div>
        <DataTable
          columns={columns}
          rows={filteredDocumentTypeList}
          rowKey={(row) => row.id}
          emptyMessage={loading ? "Loading document types..." : "No document types found."}
        />
      </div>
    </div>
  );
}
