import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import styles from "./DocumentManagement.module.css";
import { getEmployeeInfo } from "../../services/authServices";

import ProcessList from "./ProcessList";
import ProcessDetails from "./ProcessDetails";
import ActivityDocuments from "./ActivityDocuments";

import EmailTemplate from "../EmailTemplate/EmailTemplate";
import { useAuth } from "../../context/AuthContext";


const BASE_PATH="/document-management";

const MAIN_MENU = [
  { key: "process", label: "Process" },
  // { key: "emailTemplates", label: "Email Templates" },
];

export default function DocumentManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employee, setEmployee] = useState(null);

  const userData = JSON.parse(localStorage.getItem("seaUser") || "{}");
  const username = userData.username || "";


  const {logout} = useAuth()

  const activeMenu = location.pathname.startsWith(`${BASE_PATH}/email-templates`)
    ? "emailTemplates"
    : "process";

  const handleMenuClick = (key) => {
    navigate(key === "emailTemplates" ? `${BASE_PATH}/email-templates` : BASE_PATH);
  };


  return (
    <div className={styles.page}>
      {/* ── Top Navigation Bar ─────────────────────────────────── */}
      <header className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <span className={styles.navbarLogo} aria-hidden="true">DM</span>
          <span className={styles.navbarBrand}>Docket Management</span>
        </div>

        <div className={styles.navbarRight}>
          <div className={styles.navbarUserBlock}>
            <span className={styles.navbarUserName}>
              {username}
            </span>
            
          </div>

          <span className={styles.navbarDivider} aria-hidden="true" />

          <button type="button" className={styles.navbarLogout} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── Page body ──────────────────────────────────────────── */}
      <div className={styles.pageBody}>
        

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
                    onOpenEmailTemplate={(process, activity) =>
                      navigate(
                        `${BASE_PATH}/email-templates/${activity.activity_id}`,
                        {
                          state: {
                            process,
                            activity,
                          },
                        }
                      )
                    }
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

              <Route path="email-templates/:activityId" element={<EmailTemplate  />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
