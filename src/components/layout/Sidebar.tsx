import React, {useEffect, useMemo, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {MenuGroup, MenuItem} from "@/constants/menu";
import {Admin} from "@/types/admin";

const COLLAPSED_GROUPS_KEY = "admin.collapsedMenuGroups";

const readCollapsedGroups = (): string[] => {
  try {
    const raw = window.localStorage.getItem(COLLAPSED_GROUPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
};

interface SidebarProps {
  groups: MenuGroup[];
  admin: Admin | null;
  /** 모바일에서 사이드바가 열려 있는지 */
  isOpen: boolean;
  /** 데스크톱에서 사이드바를 접었는지 */
  isCollapsed?: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar = ({groups, admin, isOpen, isCollapsed = false, onClose, onLogout}: SidebarProps) => {
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() => readCollapsedGroups());

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSED_GROUPS_KEY, JSON.stringify(collapsedGroups));
    } catch {
      // 저장 실패는 무시
    }
  }, [collapsedGroups]);

  // 사이드바를 닫을 때 검색어 초기화
  useEffect(() => {
    if (!isOpen) {
      setKeyword("");
    }
  }, [isOpen]);

  const trimmedKeyword = keyword.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!trimmedKeyword) {
      return groups;
    }

    return groups
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(trimmedKeyword) || group.title.toLowerCase().includes(trimmedKeyword)
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [groups, trimmedKeyword]);

  const isActive = (path: string) => location.pathname === path;
  const isGroupCollapsed = (title: string) => !trimmedKeyword && collapsedGroups.includes(title);
  const hasActiveItem = (items: MenuItem[]) => items.some(item => isActive(item.path));

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside
      className={`app-sidebar ${isOpen ? "app-sidebar--open" : ""} ${isCollapsed ? "app-sidebar--collapsed" : ""}`}
      // 접힌 상태에서는 화면 밖으로 나가므로 키보드/스크린리더 대상에서 제외
      aria-hidden={isCollapsed && !isOpen ? true : undefined}
    >
      <div className="app-sidebar__header">
        <Link to="/manage" className="app-sidebar__brand" onClick={onClose}>
          <img src="/favicon.png" alt="" className="app-sidebar__brand-mark"/>
          <span className="app-sidebar__brand-text">
            <strong>가슴속 3천원</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </Link>

        <div className="app-sidebar__search">
          <i className="bi bi-search"/>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="메뉴 검색"
            aria-label="메뉴 검색"
          />
          {keyword && (
            <button type="button" onClick={() => setKeyword("")} aria-label="검색어 지우기">
              <i className="bi bi-x-lg"/>
            </button>
          )}
        </div>
      </div>

      <nav className="app-sidebar__nav" aria-label="관리 메뉴">
        {filteredGroups.length === 0 ? (
          <p className="app-sidebar__empty">
            <i className="bi bi-inbox d-block mb-2 fs-4"/>
            일치하는 메뉴가 없습니다.
          </p>
        ) : (
          filteredGroups.map(group => {
            const collapsed = isGroupCollapsed(group.title);

            return (
              <div className="app-sidebar__group" key={group.title}>
                <button
                  type="button"
                  className="app-sidebar__group-title"
                  onClick={() => toggleGroup(group.title)}
                  aria-expanded={!collapsed}
                >
                  <i className={`bi ${group.icon}`}/>
                  <span>{group.title}</span>
                  {collapsed && hasActiveItem(group.items) && <span className="app-sidebar__group-dot"/>}
                  <i className={`bi ${collapsed ? "bi-chevron-down" : "bi-chevron-up"} app-sidebar__group-caret`}/>
                </button>

                {!collapsed && (
                  <ul className="app-sidebar__items">
                    {group.items.map(item => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`app-sidebar__item ${isActive(item.path) ? "app-sidebar__item--active" : ""}`}
                          onClick={onClose}
                          aria-current={isActive(item.path) ? "page" : undefined}
                        >
                          <i className={`bi ${item.icon}`}/>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </nav>

      <div className="app-sidebar__footer">
        <div className="app-sidebar__profile">
          <div className="app-sidebar__avatar">
            {admin?.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="app-sidebar__profile-text">
            <span className="app-sidebar__profile-name">{admin?.name || "관리자"}</span>
            <span className="app-sidebar__profile-email">{admin?.email || "-"}</span>
          </div>
        </div>

        <button type="button" className="app-sidebar__logout" onClick={onLogout}>
          <i className="bi bi-box-arrow-right"/>
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
