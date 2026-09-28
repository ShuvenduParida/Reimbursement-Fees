
import styled from "styled-components";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";


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


const Topbar = ({ pageTitle, sidebarCollapsed, onToggleSidebar }) => {
  const { logout } = useAuth();
  const userData = JSON.parse(localStorage.getItem("seaUser") || "{}");
  const username = userData.username || "";


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
      <UserName>{username}</UserName>

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
