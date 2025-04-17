import {useEffect, useState} from "react";
import RegistrationModal from "./RegistrationModal";
import registrationApi from "../../api/registrationApi";

const RegistrationManagement = () => {
  const [registrationList, setRegistrationList] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = () => {
    registrationApi.listRegistrations({size: 30})
      .then((response) => {
        if (!response.ok) {
          return
        }
        setRegistrationList(response.data.contents);
      });
  };

  const handleRegistrationUpdate = () => {
    fetchRegistrations();
    setSelectedRegistration(null);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2 className="fw-bold">📝 가입 신청 관리</h2>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <button className="btn btn-primary" onClick={fetchRegistrations}>
            🔍 새로고침
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center">
          <thead className="table-dark">
          <tr>
            <th>대표자명</th>
            <th>사업자번호</th>
            <th>가게명</th>
            <th>카테고리</th>
            <th>신청일</th>
            <th>상세</th>
          </tr>
          </thead>
          <tbody>
          {registrationList.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-5 text-muted fs-5">
                📭 등록된 가입 신청이 없습니다.
              </td>
            </tr>
          ) : (
            registrationList.map((reg) => (
              <tr key={reg.registrationId}>
                <td>{reg.boss.name} ({reg.boss.socialType})</td>
                <td>{reg.boss.businessNumber}</td>
                <td>{reg.store.name}</td>
                <td>{reg.store.categories.join(", ")}</td>
                <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSelectedRegistration(reg)}
                  >
                    상세 보기
                  </button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      <RegistrationModal
        show={!!selectedRegistration}
        onHide={handleRegistrationUpdate}
        registration={selectedRegistration}
      />
    </div>
  );
};

export default RegistrationManagement;
