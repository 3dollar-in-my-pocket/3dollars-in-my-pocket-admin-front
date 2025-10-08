import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {BiCalendar, BiLinkExternal} from "react-icons/bi";
import {HiOutlineSpeakerphone} from "react-icons/hi";
import advertisementApi from "../../api/advertisementApi";
import {toast} from "react-toastify";
import AdvertisementEditModal from "./AdvertisementEditModal";
import AdTimer from "../../components/common/AdTimer";

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
    try {
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
    } catch (error) {
      toast.error("❌ 광고 삭제 중 오류가 발생했습니다.");
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
            <div className="row align-items-center">
              <div className="col-12 col-lg-4 text-center mb-3 mb-lg-0">
                <AdTimer
                  startDateTime={ad.startDateTime}
                  endDateTime={ad.endDateTime}
                  className=""
                />
              </div>
              <div className="col-12 col-lg-8">
                <div className="row g-2">
                  <div className="col-6 col-md-3">
                    <div className="text-center p-2 bg-light rounded">
                      <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>그룹 ID</small>
                      <strong className="text-primary" style={{fontSize: '0.85rem'}}>{ad.groupId}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-2 bg-light rounded">
                      <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>플랫폼</small>
                      <strong style={{fontSize: '0.85rem'}}>{getDescriptionFromKey(ad.platformType, "platform")}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-2 bg-light rounded">
                      <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>구좌</small>
                      <strong style={{fontSize: '0.85rem'}}>{getDescriptionFromKey(ad.positionType, "position")}</strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-2 bg-light rounded">
                      <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>정렬</small>
                      <strong style={{fontSize: '0.85rem'}}>
                        {ad.orderType === "PINNED"
                          ? `고정(${ad.sortNumber ?? "미정"})`
                          : "랜덤"}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="row g-2 mt-2">
                  <div className="col-6">
                    <div className="text-center p-2 bg-success-subtle rounded">
                      <small className="text-success d-block" style={{fontSize: '0.7rem'}}>
                        <BiCalendar className="me-1"/>시작일
                      </small>
                      <strong className="text-success" style={{fontSize: '0.8rem'}}>
                        {formatDateTime(ad.startDateTime)}
                      </strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-2 bg-danger-subtle rounded">
                      <small className="text-danger d-block" style={{fontSize: '0.7rem'}}>
                        <BiCalendar className="me-1"/>종료일
                      </small>
                      <strong className="text-danger" style={{fontSize: '0.8rem'}}>
                        {formatDateTime(ad.endDateTime)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 컨텐츠 섹션 */}
          <div className="bg-white border-bottom px-4 py-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary-subtle rounded-circle p-2 me-3">
                <i className="bi bi-card-text text-primary fs-5"></i>
              </div>
              <h5 className="mb-0 text-primary fw-bold">컨텐츠 정보</h5>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <div className="bg-light rounded p-4">
                  <h3 className="fw-bold mb-2 text-dark">{ad.title}</h3>
                  {ad.subTitle && (
                    <p className="text-muted mb-0 fs-5">{ad.subTitle}</p>
                  )}
                </div>
              </div>
              {ad.extraContent && (
                <div className="col-12">
                  <div className="border-start border-primary border-3 ps-3">
                    <small className="text-muted d-block mb-1">
                      <i className="bi bi-cursor-fill me-1"></i>버튼 텍스트
                    </small>
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 fs-6">
                      {ad.extraContent}
                    </span>
                  </div>
                </div>
              )}
              {ad.description && (
                <div className="col-12">
                  <div className="border-start border-info border-3 ps-3">
                    <small className="text-muted d-block mb-1">
                      <i className="bi bi-info-circle me-1"></i>설명
                    </small>
                    <p className="mb-0 text-dark">{ad.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 이미지 섹션 */}
          {ad.imageUrl && (
            <div className="bg-white border-bottom px-4 py-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success-subtle rounded-circle p-2 me-3">
                  <i className="bi bi-image text-success fs-5"></i>
                </div>
                <h5 className="mb-0 text-success fw-bold">광고 이미지</h5>
              </div>
              <div className="text-center">
                <div className="position-relative d-inline-block mb-3">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    onLoad={handleImageLoad}
                    className="img-fluid rounded shadow-lg"
                    style={{
                      maxHeight: "500px",
                      maxWidth: "100%",
                      objectFit: "contain",
                      backgroundColor: "#f8f9fa",
                      ...(ad.imageWidth && ad.imageHeight && {
                        aspectRatio: `${ad.imageWidth} / ${ad.imageHeight}`
                      })
                    }}
                  />
                  {/* 이미지 확대 버튼 */}
                  <a
                    href={ad.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="position-absolute top-0 end-0 m-2 btn btn-dark btn-sm rounded-circle"
                    style={{width: '40px', height: '40px', opacity: 0.8}}
                    title="이미지 새 창에서 열기"
                  >
                    <i className="bi bi-arrows-fullscreen"></i>
                  </a>
                </div>
                <div className="row g-2 justify-content-center">
                  {(ad.imageWidth && ad.imageHeight) && (
                    <div className="col-auto">
                      <span className="badge bg-success-subtle text-success px-3 py-2">
                        <i className="bi bi-server me-1"></i>
                        서버: {ad.imageWidth} × {ad.imageHeight}px
                      </span>
                    </div>
                  )}
                  {imageSize.width > 0 && (
                    <div className="col-auto">
                      <span className="badge bg-info-subtle text-info px-3 py-2">
                        <i className="bi bi-eye me-1"></i>
                        실제: {imageSize.width} × {imageSize.height}px
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
          <div className="d-flex w-100 gap-3 flex-column flex-sm-row">
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                padding: '15px 24px',
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
              <i className="bi bi-trash fs-5"></i>
              삭제
            </Button>
            <Button
              variant="outline-secondary"
              onClick={onHide}
              className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                padding: '15px 24px',
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
              <i className="bi bi-x-lg fs-5"></i>
              닫기
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowEdit(true)}
              className="flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                padding: '15px 24px',
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
              <i className="bi bi-pencil fs-5"></i>
              수정
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
    </>
  );
};

export default AdvertisementModal;
