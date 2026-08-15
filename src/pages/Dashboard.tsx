import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {useAuthStore} from "@/state/authStore";
import useMenuGroups from "@/hooks/useMenuGroups";
import useRecentMenus from "@/hooks/useRecentMenus";
import EmptyState from "@/components/common/EmptyState";

const Dashboard = () => {
  const adminAuth = useAuthStore((state) => state.admin);
  const menuGroups = useMenuGroups();
  const recentMenus = useRecentMenus(menuGroups);
  const [keyword, setKeyword] = useState("");

  const trimmedKeyword = keyword.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!trimmedKeyword) {
      return menuGroups;
    }

    return menuGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(trimmedKeyword) || group.title.toLowerCase().includes(trimmedKeyword)
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [menuGroups, trimmedKeyword]);

  const totalMenuCount = useMemo(
    () => menuGroups.reduce((sum, group) => sum + group.items.length, 0),
    [menuGroups]
  );

  return (
    <div className="dashboard">
      {/* 헤더 */}
      <div className="dashboard__hero">
        <img src="/favicon.png" alt="" className="dashboard__hero-logo"/>
        <div className="min-w-0">
          <h2 className="dashboard__title">
            안녕하세요, {adminAuth?.name || "관리자"}님 👋
          </h2>
          <p className="dashboard__subtitle">
            가슴속 3천원 어드민 콘솔입니다. 접근 가능한 메뉴 {totalMenuCount}개를 아래에서 바로 이동할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 최근 사용한 메뉴 */}
      {recentMenus.length > 0 && (
        <section className="mb-4">
          <h3 className="dashboard__section-title">
            <i className="bi bi-clock-history"/>
            최근 사용한 메뉴
          </h3>
          <div className="dashboard__chips">
            {recentMenus.map(item => (
              <Link to={item.path} key={item.path} className="dashboard__chip">
                <i className={`bi ${item.icon}`}/>
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 메뉴 검색 */}
      <div className="dashboard__search">
        <i className="bi bi-search"/>
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="메뉴 이름으로 검색"
          aria-label="메뉴 검색"
        />
        {keyword && (
          <button type="button" onClick={() => setKeyword("")} aria-label="검색어 지우기">
            <i className="bi bi-x-lg"/>
          </button>
        )}
      </div>

      {/* 메뉴 그룹 카드 */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon="bi-search"
          title="일치하는 메뉴가 없습니다"
          description={trimmedKeyword ? `"${keyword.trim()}" 검색 결과가 없습니다.` : "접근 가능한 메뉴가 없습니다. 관리자에게 문의해주세요."}
        />
      ) : (
        <div className="row g-3">
          {filteredGroups.map(group => (
            <div className="col-md-6 col-xl-4" key={group.title}>
              <div className="dashboard__card">
                <div className="dashboard__card-head">
                  <span className="dashboard__card-icon">
                    <i className={`bi ${group.icon}`}/>
                  </span>
                  <div className="min-w-0">
                    <h4 className="dashboard__card-title">{group.title}</h4>
                    <p className="dashboard__card-desc">{group.description}</p>
                  </div>
                  <span className="dashboard__card-count">{group.items.length}</span>
                </div>

                <ul className="dashboard__card-list">
                  {group.items.map(item => (
                    <li key={item.path}>
                      <Link to={item.path} className="dashboard__card-link">
                        <i className={`bi ${item.icon}`}/>
                        <span>{item.label}</span>
                        <i className="bi bi-chevron-right dashboard__card-link-arrow"/>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
