import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {BiCalendar, BiLinkExternal} from "react-icons/bi";
import {HiOutlineSpeakerphone} from "react-icons/hi";
import advertisementApi from "../../api/advertisementApi";
import {toast} from "react-toastify";
import AdvertisementEditModal from "./AdvertisementEditModal";
import AdvertisementContentEditModal from "./AdvertisementContentEditModal";
import AdTimer from "../../components/common/AdTimer";
import AdPreview from "../../components/advertisement/AdPreview";

const AdvertisementModal = ({
                              show,
                              onHide,
                              ad,
                              getDescriptionFromKey,
                              formatDateTime,
                              fetchAdvertisements,
                              positions
                            }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showContentEdit, setShowContentEdit] = useState(false);
  const [imageSize, setImageSize] = useState({width: 0, height: 0});

  if (!ad) return null;

  const handleImageLoad = (e) => {
    const {naturalWidth, naturalHeight} = e.target;
    setImageSize({width: naturalWidth, height: naturalHeight});
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) {
      return
    }
    const response = await advertisementApi.deleteAd({
      application: "USER_API",
      advertisementId: ad.advertisementId,
    });  // 광고 삭제 API 호출
    if (response.ok) {
      toast.success("✅ 광고가 삭제되었습니다.");
      fetchAdvertisements();
    } else {
      toast.error("❌ 광고 삭제에 실패했습니다.");
    }
    onHide()
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered fullscreen="lg-down">
        <Modal.Header closeButton className="border-0"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        minHeight: '80px'
                      }}>
          <Modal.Title className="text-white d-flex align-items-center gap-3 w-100 justify-content-center">
            <div className="bg-white bg-opacity-20 rounded-circle p-3">
              <HiOutlineSpeakerphone className="fs-4"/>
            </div>
            <div>
              <h3 className="mb-0 fw-bold">광고 상세 정보</h3>
              <small className="text-white-75 opacity-75">ID: {ad.advertisementId}</small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0" style={{backgroundColor: '#f8f9fa'}}>
          {/* 상태 및 타이머 섹션 */}
          <div className="bg-white border-bottom px-4 py-3">
            <div className="row g-3">
              {/* 상태 타이머 */}
              <div className="col-12">
                <div className="bg-light rounded p-3">
                  <AdTimer
                    startDateTime={ad.startDateTime}
                    endDateTime={ad.endDateTime}
                    className="text-center"
                  />
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="col-12">
                <div className="row g-2">
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded border">
                      <small className="text-muted d-block mb-2" style={{fontSize: '0.7rem'}}>
                        <i className="bi bi-hash me-1"></i>광고 ID
                      </small>
                      <strong className="text-primary" style={{fontSize: '0.9rem'}}>{ad.advertisementId}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded border">
                      <small className="text-muted d-block mb-2" style={{fontSize: '0.7rem'}}>
                        <i className="bi bi-collection me-1"></i>캠페인
                      </small>
                      <strong className="text-primary" style={{fontSize: '0.9rem'}}>{ad.groupId}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded border">
                      <small className="text-muted d-block mb-2" style={{fontSize: '0.7rem'}}>
                        <i className="bi bi-geo-alt me-1"></i>구좌
                      </small>
                      <strong style={{fontSize: '0.9rem'}}>{getDescriptionFromKey(ad.positionType, "position")}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded border">
                      <small className="text-muted d-block mb-2" style={{fontSize: '0.7rem'}}>
                        <i className="bi bi-sort-numeric-down me-1"></i>정렬
                      </small>
                      <strong style={{fontSize: '0.9rem'}}>
                        {ad.orderType === "PINNED"
                          ? `고정(${ad.sortNumber ?? "미정"})`
                          : "랜덤"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 플랫폼 정보 */}
              <div className="col-12">
                <div className="p-3 bg-light rounded border">
                  <small className="text-muted d-block mb-3 text-center fw-semibold" style={{fontSize: '0.75rem'}}>
                    <i className="bi bi-phone me-1"></i>노출 플랫폼
                  </small>
                  <div className="d-flex justify-content-center gap-3">
                    {(ad.platformType === 'ALL' || ad.platformType === 'AOS') && (
                      <div
                        className="d-flex align-items-center gap-2 px-3 py-2 rounded bg-success-subtle border border-success">
                        <i className="bi bi-android2 text-success" style={{fontSize: '1.2rem'}}></i>
                        <small className="fw-semibold text-success" style={{fontSize: '0.85rem'}}>
                          Android
                        </small>
                      </div>
                    )}
                    {(ad.platformType === 'ALL' || ad.platformType === 'IOS') && (
                      <div
                        className="d-flex align-items-center gap-2 px-3 py-2 rounded bg-primary-subtle border border-primary">
                        <i className="bi bi-apple text-primary" style={{fontSize: '1.2rem'}}></i>
                        <small className="fw-semibold text-primary" style={{fontSize: '0.85rem'}}>
                          iOS
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 일정 정보 */}
              <div className="col-12">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="text-center p-3 bg-success-subtle rounded border border-success">
                      <small className="text-success d-block mb-2 fw-semibold" style={{fontSize: '0.75rem'}}>
                        <BiCalendar className="me-1"/>시작일시
                      </small>
                      <strong className="text-success d-block" style={{fontSize: '0.85rem'}}>
                        {formatDateTime(ad.startDateTime)}
                      </strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-danger-subtle rounded border border-danger">
                      <small className="text-danger d-block mb-2 fw-semibold" style={{fontSize: '0.75rem'}}>
                        <BiCalendar className="me-1"/>종료일시
                      </small>
                      <strong className="text-danger d-block" style={{fontSize: '0.85rem'}}>
                        {formatDateTime(ad.endDateTime)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 미리보기 섹션 */}
          <div className="bg-white border-bottom px-4 py-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-info-subtle rounded-circle p-2 me-3">
                <i className="bi bi-eye text-info fs-5"></i>
              </div>
              <h5 className="mb-0 text-info fw-bold">광고 미리보기</h5>
            </div>
            <div className="bg-light rounded p-4">
              <AdPreview
                positionType={ad.positionType}
                imageUrl={ad.imageUrl}
                title={ad.title}
                subTitle={ad.subTitle}
                extraContent={ad.extraContent}
                titleFontColor={ad.titleFontColor}
                subTitleFontColor={ad.subTitleFontColor}
                extraContentFontColor={ad.extraContentFontColor}
                backgroundColor={ad.backgroundColor}
              />
            </div>
          </div>

          {/* 링크 섹션 */}
          <div className="bg-white px-4 py-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-warning-subtle rounded-circle p-2 me-3">
                <BiLinkExternal className="text-warning fs-5"/>
              </div>
              <h5 className="mb-0 text-warning fw-bold">링크 정보</h5>
            </div>
            <div className="bg-light rounded p-4">
              <div className="d-flex flex-column flex-sm-row align-items-start gap-3">
                <div className="flex-grow-1">
                  <small className="text-muted d-block mb-2">
                    <i className="bi bi-link-45deg me-1"></i>대상 URL
                  </small>
                  <div className="bg-white rounded p-3 border">
                    <code className="text-primary text-break" style={{fontSize: '0.9rem'}}>
                      {ad.linkUrl}
                    </code>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-warning btn-sm d-flex align-items-center gap-2"
                    style={{minWidth: '120px'}}
                  >
                    <i className="bi bi-box-arrow-up-right"></i>
                    새 창에서 열기
                  </a>
                  <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                    onClick={() => {
                      navigator.clipboard.writeText(ad.linkUrl);
                      toast.success('링크가 복사되었습니다!');
                    }}
                    style={{minWidth: '120px'}}
                  >
                    <i className="bi bi-clipboard"></i>
                    링크 복사
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 p-4" style={{background: 'linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%)'}}>
          <div className="d-flex w-100 gap-2 flex-column flex-sm-row">
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                padding: '15px 20px',
                borderRadius: '12px',
                borderWidth: '2px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e: any) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
              }}
              onMouseLeave={(e: any) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-trash fs-6"></i>
              <span className="d-none d-sm-inline">삭제</span>
            </Button>
            <Button
              variant="outline-secondary"
              onClick={onHide}
              className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                padding: '15px 20px',
                borderRadius: '12px',
                borderWidth: '2px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e: any) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
              }}
              onMouseLeave={(e: any) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-x-lg fs-6"></i>
              <span className="d-none d-sm-inline">닫기</span>
            </Button>
            <Button
              variant="info"
              onClick={() => setShowContentEdit(true)}
              className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold text-white"
              style={{
                padding: '15px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e: any) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e: any) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-palette fs-6"></i>
              <span className="d-none d-md-inline">컨텐츠 수정</span>
              <span className="d-inline d-md-none">컨텐츠</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowEdit(true)}
              className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                padding: '15px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e: any) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.4)';
              }}
              onMouseLeave={(e: any) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-gear fs-6"></i>
              <span className="d-none d-md-inline">기본 정보 수정</span>
              <span className="d-inline d-md-none">정보</span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <AdvertisementEditModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        ad={ad}
        positions={positions}
        fetchAdvertisements={fetchAdvertisements}
      />
      <AdvertisementContentEditModal
        show={showContentEdit}
        onHide={() => setShowContentEdit(false)}
        ad={ad}
        fetchAdvertisements={fetchAdvertisements}
      />
    </>
  );
};

export default AdvertisementModal;
