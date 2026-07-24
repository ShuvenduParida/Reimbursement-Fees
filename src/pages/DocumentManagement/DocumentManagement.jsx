import React, { useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import styles from "./DocumentManagement.module.css";

import ProcessList from "./ProcessList";
import ProcessDetails from "./ProcessDetails";
import ActivityDocuments from "./ActivityDocuments";
import EmailTemplatePage from "./EmailTemplatePage";
import { useAuth } from "../../context/AuthContext";

/* ------------------------------------------------------------------ */
/* Mount path                                                          */
/* ------------------------------------------------------------------ */
/* This module owns its own nested routes below BASE_PATH. Wire it into */
/* the existing app router with a wildcard, e.g.:                       */
/*                                                                      */
/*   <Route path="/document-management/*" element={<DocumentManagement />} /> */
/*                                                                      */
/* That one line is the only router change needed — nothing else about */
/* the existing routing, layout, sidebar, navbar or auth is touched.    */
/* If the module is mounted at a different path, update BASE_PATH below */
/* to match — nothing else in this file needs to change.                */
/* ------------------------------------------------------------------ */
const BASE_PATH="/document-management";

const MAIN_MENU = [
  { key: "process", label: "Process" },
  { key: "emailTemplates", label: "Email Templates" },
];

export default function DocumentManagement() {
  const navigate = useNavigate();
  const location = useLocation();

  const {logout} = useAuth()

  const activeMenu = location.pathname.startsWith(`${BASE_PATH}/email-templates`)
    ? "emailTemplates"
    : "process";

  const handleMenuClick = (key) => {
    navigate(key === "emailTemplates" ? `${BASE_PATH}/email-templates` : BASE_PATH);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Docket Management</h1>
        <button
        className={styles.logoutButton}
        onClick={logout}
    >
        Logout
    </button>
        <p className={styles.subtitle}>
          Manage processes, their activities and the documents required to complete them.
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabsList} role="tablist">
          {MAIN_MENU.map((menu) => (
            <button
              key={menu.key}
              role="tab"
              type="button"
              aria-selected={activeMenu === menu.key}
              className={`${styles.tabButton} ${
                activeMenu === menu.key ? styles.tabButtonActive : ""
              }`}
              onClick={() => handleMenuClick(menu.key)}
            >
              {menu.label}
            </button>
          ))}
        </div>

        <div className={styles.tabPanel}>
          <Routes>
            <Route
              index
              element={
                <ProcessList
                  onView={(process) =>
                    navigate(`${BASE_PATH}/process/${process.process_id}`, {
                      state: { process },
                    })
                  }
                />
              }
            />

            <Route
              path="process/:processId"
              element={
                <ProcessDetails
                  onBack={() => navigate(BASE_PATH)}
                  onOpenDocuments={(process, activity) =>
                    navigate(
                      `${BASE_PATH}/process/${process.process_id}/activity/${activity.activity_id}/documents`,
                      { state: { process, activity } }
                    )
                  }
                  onOpenEmailTemplate={() => navigate(`${BASE_PATH}/email-templates`)}
                />
              }
            />

            <Route
              path="process/:processId/activity/:activityId/documents"
              element={
                <ActivityDocuments
                  onBackToList={() => navigate(BASE_PATH)}
                  onBack={(process) =>
                    navigate(`${BASE_PATH}/process/${process.process_id}`, {
                      state: { process },
                    })
                  }
                />
              }
            />

            <Route path="email-templates" element={<EmailTemplatePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
