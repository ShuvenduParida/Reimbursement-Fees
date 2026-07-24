import React from "react";
import styles from "./DocumentManagement.module.css";

export default function EmailTemplatePage() {
  return (
    <div>
      <div className={styles.tabsContainer} style={{ padding: "44px 24px", textAlign: "center" }}>
        <p className={styles.summaryTitle} style={{ marginBottom: 6, fontSize: 16 }}>
          Email Templates
        </p>
        <p className={styles.summaryDescription} style={{ maxWidth: 420, margin: "0 auto" }}>
          Email template management is coming soon. This section will let you configure the
          notification templates used across the document workflow.
        </p>
      </div>
    </div>
  );
}
