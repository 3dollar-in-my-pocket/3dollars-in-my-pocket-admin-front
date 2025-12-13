import {useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import statisticsApi from "../api/statisticsApi";

interface StatsCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  link?: string;
  loading?: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [stats, setStats] = useState<StatsCard[]>([
    {
      title: "유저 (USER)",
      value: "-",
      icon: "bi-people-fill",
      color: "primary",
      link: "/manage/user-search",
      loading: true
    },
    {
      title: "사장님 (BOSS)",
      value: "-",
      icon: "bi-person-badge-fill",
      color: "success",
      link: "/manage/registration",
      loading: true
    },
    {
      title: "일반 가게 (USER_STORE)",
      value: "-",
      icon: "bi-shop",
      color: "info",
      link: "/manage/store-search",
      loading: true
    },
    {
      title: "사장님 가게 (BOSS_STORE)",
      value: "-",
      icon: "bi-shop-window",
      color: "warning",
      link: "/manage/store-search",
      loading: true
    },
  ]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    try {
      // 유저 통계
      const userResponse = await statisticsApi.getDailyStatistics("USER", yesterdayStr, yesterdayStr);
      if (userResponse.ok && userResponse.data?.contents?.length > 0) {
        const userCount = userResponse.data.contents[0].totalCount;
        updateStat(0, userCount.toLocaleString("ko-KR"));
      } else {
        updateStat(0, "0");
      }
    } catch (error) {
      console.error("유저 통계 조회 실패:", error);
      updateStat(0, "오류");
    }

    try {
      // 사장님 통계
      const bossResponse = await statisticsApi.getDailyStatistics("BOSS", yesterdayStr, yesterdayStr);
      if (bossResponse.ok && bossResponse.data?.contents?.length > 0) {
        const bossCount = bossResponse.data.contents[0].totalCount;
        updateStat(1, bossCount.toLocaleString("ko-KR"));
      } else {
        updateStat(1, "0");
      }
    } catch (error) {
      console.error("사장님 통계 조회 실패:", error);
      updateStat(1, "오류");
    }

    try {
      // 일반 가게 통계
      const userStoreResponse = await statisticsApi.getDailyStatistics("USER_STORE", yesterdayStr, yesterdayStr);
      if (userStoreResponse.ok && userStoreResponse.data?.contents?.length > 0) {
        const userStoreCount = userStoreResponse.data.contents[0].totalCount;
        updateStat(2, userStoreCount.toLocaleString("ko-KR"));
      } else {
        updateStat(2, "0");
      }
    } catch (error) {
      console.error("일반 가게 통계 조회 실패:", error);
      updateStat(2, "오류");
    }

    try {
      // 사장님 가게 통계
      const bossStoreResponse = await statisticsApi.getDailyStatistics("BOSS_STORE", yesterdayStr, yesterdayStr);
      if (bossStoreResponse.ok && bossStoreResponse.data?.contents?.length > 0) {
        const bossStoreCount = bossStoreResponse.data.contents[0].totalCount;
        updateStat(3, bossStoreCount.toLocaleString("ko-KR"));
      } else {
        updateStat(3, "0");
      }
    } catch (error) {
      console.error("사장님 가게 통계 조회 실패:", error);
      updateStat(3, "오류");
    }

    // 마지막 업데이트 시간 저장
    setLastUpdateTime(new Date().toLocaleString('ko-KR'));
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const updateStat = (index: number, value: string | number) => {
    setStats((prevStats) => {
      const newStats = [...prevStats];
      newStats[index] = {...newStats[index], value, loading: false};
      return newStats;
    });
  };

  const quickLinks = [
    {
      title: "유저 검색",
      icon: "bi-search",
      route: "/manage/user-search",
      description: "유저 정보 조회"
    },
    {
      title: "가게 검색",
      icon: "bi-shop",
      route: "/manage/store-search",
      description: "가게 정보 조회"
    },
    {
      title: "푸시 발송",
      icon: "bi-send-fill",
      route: "/manage/push-message",
      description: "푸시 메시지 발송"
    },
    {
      title: "광고 관리",
      icon: "bi-bullseye",
      route: "/manage/advertisement",
      description: "광고 등록 및 관리"
    },
    {
      title: "서비스 통계",
      icon: "bi-graph-up",
      route: "/info/service-statistics",
      description: "서비스 사용 통계"
    },
    {
      title: "광고 통계",
      icon: "bi-badge-ad",
      route: "/info/ad-statistics",
      description: "광고 관련 통계"
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-2">📊 관리자 대시보드</h2>
        <p className="text-muted mb-0">서비스 주요 지표 및 최근 활동을 확인할 수 있습니다</p>
      </div>

      {/* 주요 통계 카드 */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-semibold mb-0">주요 지표</h4>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate("/info/service-statistics")}
          >
            <i className="bi bi-graph-up me-1"></i>
            통계 페이지로 이동
          </button>
        </div>
        <div className="row g-3">
          {stats.map((stat, idx) => (
            <div className="col-md-6 col-lg-3" key={idx}>
              <div
                className={`card border-0 shadow-sm h-100 ${stat.link ? 'cursor-pointer hover-shadow' : ''}`}
                onClick={() => stat.link && navigate(stat.link)}
                role={stat.link ? "button" : undefined}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-muted mb-1 small">{stat.title}</p>
                      {stat.loading ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">로딩 중...</span>
                          </div>
                          <span className="text-muted small">로딩 중...</span>
                        </div>
                      ) : (
                        <h3 className="fw-bold mb-0">{stat.value}</h3>
                      )}
                    </div>
                    <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded`}>
                      <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title fw-semibold mb-4">빠른 접근</h5>
            <div className="row g-3">
              {quickLinks.map((link, idx) => (
                <div className="col-6 col-md-4 col-lg-2" key={idx}>
                  <div
                    className="card border shadow-sm h-100 cursor-pointer hover-shadow"
                    onClick={() => navigate(link.route)}
                    role="button"
                  >
                    <div className="card-body text-center p-3">
                      <i className={`bi ${link.icon} fs-2 text-primary mb-2`}></i>
                      <h6 className="mb-1 fw-semibold small">{link.title}</h6>
                      <p className="mb-0 text-muted" style={{fontSize: "0.75rem"}}>{link.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
