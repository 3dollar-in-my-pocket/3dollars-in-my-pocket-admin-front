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
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <HiOutlineSpeakerphone className="me-2"/>
            광고 상세 정보
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <div className="row gy-4">
            <div className="col-12">
              <div className="bg-white rounded shadow-sm p-3">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <strong>ID:</strong> {ad.advertisementId}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>GroupId:</strong> {ad.groupId}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>플랫폼:</strong> {getDescriptionFromKey(ad.platformType, "platform")}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>구좌:</strong> {getDescriptionFromKey(ad.positionType, "position")}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>정렬 방식:</strong>{" "}
                    {ad.orderType === "PINNED"
                      ? `고정 (${ad.sortNumber ?? "미정"})`
                      : ad.orderType || "-"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>설명:</strong> {ad.description || "-"}
                  </div>
                  <div className="col-12 mb-3">
                    {/* 광고 상태 및 타이머 */}
                    <div className="border rounded p-3 bg-light">
                      <h6 className="fw-bold mb-2">📅 광고 상태</h6>
                      <AdTimer
                        startDateTime={ad.startDateTime}
                        endDateTime={ad.endDateTime}
                        className="mb-3"
                      />
                      <div className="row">
                        <div className="col-md-6">
                          <strong>
                            <BiCalendar className="me-1"/>
                            시작일:
                          </strong>{" "}
                          {formatDateTime(ad.startDateTime)}
                        </div>
                        <div className="col-md-6">
                          <strong>
                            <BiCalendar className="me-1"/>
                            종료일:
                          </strong>{" "}
                          {formatDateTime(ad.endDateTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="bg-white rounded shadow-sm p-3">
                <h5 className="fw-bold mb-2">{ad.title}</h5>
                <p className="text-muted">{ad.subTitle}</p>
                {ad.extraContent && (
                  <p className="mt-2">
                    <strong>📎 버튼:</strong> {ad.extraContent}
                  </p>
                )}
              </div>
            </div>

            {ad.imageUrl && (
              <div className="col-12">
                <div className="bg-white rounded shadow-sm p-3 text-center">
                  <strong>📷 광고 이미지</strong>
                  <div className="mt-3">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      onLoad={handleImageLoad}
                      className="img-fluid rounded"
                      style={{
                        maxHeight: "300px",
                        objectFit: "contain",
                        ...(ad.imageWidth && ad.imageHeight && {
                          aspectRatio: `${ad.imageWidth} / ${ad.imageHeight}`
                        })
                      }}
                    />
                    <div className="text-muted mt-2 small">
                      {ad.imageWidth && ad.imageHeight ? (
                        <span>서버 이미지 크기: {ad.imageWidth} × {ad.imageHeight} px</span>
                      ) : imageSize.width > 0 ? (
                        <span>이미지 크기: {imageSize.width} × {imageSize.height} px</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 링크 섹션 */}
            <div className="bg-white p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-danger-subtle rounded-circle p-2 me-3">
                  <BiLinkExternal className="text-danger fs-5"/>
                </div>
                <h5 className="mb-0 text-danger fw-bold">링크 정보</h5>
              </div>
              <div className="bg-light rounded p-3">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-link-45deg me-1"></i>대상 URL
                </small>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-break">{ad.linkUrl}</span>
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i>
                    열기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light p-4">
          <div className="d-flex w-100 gap-2 flex-column flex-sm-row">
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              className="flex-fill d-flex align-items-center justify-content-center gap-2"
              style={{padding: '12px 24px'}}
            >
              <i className="bi bi-trash"></i>
              삭제
            </Button>
            <Button
              variant="outline-secondary"
              onClick={onHide}
              className="flex-fill d-flex align-items-center justify-content-center gap-2"
              style={{padding: '12px 24px'}}
            >
              <i className="bi bi-x-lg"></i>
              닫기
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowEdit(true)}
              className="flex-fill d-flex align-items-center justify-content-center gap-2"
              style={{padding: '12px 24px'}}
            >
              <i className="bi bi-pencil"></i>
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
