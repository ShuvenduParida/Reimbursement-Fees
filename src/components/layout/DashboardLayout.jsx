// src/components/layout/DashboardLayout.jsx
import { useEffect, useState } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/reimbursement/tokens.css";

const SIDEBAR_STORAGE_KEY = "rf.sidebar.collapsed";

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--rf-paper);
`;

const ShellMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const ShellContent = styled.main`
  flex: 1;
  padding: 24px 28px 48px;

  @media (max-width: 640px) {
    padding: 18px 16px 36px;
  }
`;

/**
 * Sidebar state lives here (the parent layout) rather than inside Sidebar
 * itself, so there is a single source of truth for both the mobile drawer
 * and the desktop collapse state. Sidebar and Topbar are purely
 * presentational with respect to this state.
 */
const DashboardLayout = ({ activeNav, pageTitle, breadcrumb, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }, [collapsed]);

  // One control drives both behaviors: on desktop it collapses/expands the
  // fixed sidebar, on mobile (where the sidebar is an off-canvas drawer) it
  // opens/closes that drawer instead.
  const handleToggleSidebar = () => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth > 900;
    if (isDesktop) {
      setCollapsed((value) => !value);
    } else {
      setMobileSidebarOpen((open) => !open);
    }
  };

  return (
    <Shell className="rf-module">
      <Sidebar
        activeNav={activeNav}
        collapsed={collapsed}
        onExpand={() => setCollapsed(false)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <ShellMain>
        <Topbar
          pageTitle={pageTitle}
          breadcrumb={breadcrumb}
          sidebarCollapsed={collapsed}
          onToggleSidebar={handleToggleSidebar}
        />
        <ShellContent>{children}</ShellContent>
      </ShellMain>
    </Shell>
  );
};

export default DashboardLayout;
