// src/components/layout/Topbar.jsx
import { useMemo } from "react";
import styled from "styled-components";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

// Pulls whatever usable display name it can find from the existing auth
// context. None of these fields are guaranteed to be populated, so every
// step falls through to the next, and "User" is the final fallback —
// this never throws and never shows "undefined".
function resolveDisplayName(currentUser, profile) {
  const fromProfile =
    profile?.name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.company_name;
  if (fromProfile) return fromProfile;

  const username = currentUser?.username;
  if (username) return username.includes("@") ? username.split("@")[0] : username;

  return "User";
}

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const Header = styled.header`
  height: 64px;
  flex-shrink: 0;
  background: var(--rf-surface);
  border-bottom: 1px solid var(--rf-line);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 20;
`;

const MenuBtn = styled.button`
  display: inline-flex;
  background: transparent;
  border: none;
  color: var(--rf-ink);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--rf-radius-sm);

  &:hover {
    background: var(--rf-paper);
  }
`;

const Titles = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
`;

const Title = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--rf-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Actions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
`;


const UserName = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 13px;
  font-weight: 500;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;


const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-sm);
  background: var(--rf-surface);
  color: var(--rf-rust);
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: var(--rf-rust-soft);
  }
`;

// A single control drives sidebar state: on desktop it collapses/expands
// the fixed sidebar, on mobile it opens the off-canvas drawer. The decision
// of which behavior applies lives in DashboardLayout (onToggleSidebar) —
// this component just renders the trigger.
const Topbar = ({ pageTitle, sidebarCollapsed, onToggleSidebar }) => {
  const { currentUser, profile, logout } = useAuth();


  const displayName = useMemo(() => resolveDisplayName(currentUser, profile), [currentUser, profile]);
  return (
  <Header>
    <MenuBtn
      type="button"
      onClick={onToggleSidebar}
      aria-label={sidebarCollapsed ? "Expand navigation" : "Toggle navigation"}
      title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <FiMenu size={20} />
    </MenuBtn>

    <Titles>
      <Title>{pageTitle}</Title>
    </Titles>

    <Actions>
      {/* User Name */}
      <UserName>{displayName}</UserName>

      {/* Logout Button */}
      <LogoutBtn type="button" onClick={logout}>
        <FiLogOut size={15} />
        <span>Log out</span>
      </LogoutBtn>
    </Actions>
  </Header>
);
};

export default Topbar;
