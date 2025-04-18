import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {BiCalendar, BiLinkExternal} from "react-icons/bi";
import {HiOutlineSpeakerphone} from "react-icons/hi";
import advertisementApi from "../../api/advertisementApi";
import {toast} from "react-toastify";

const AdvertisementModal = ({show, onHide, ad, getDescriptionFromKey, formatDateTime, fetchAdvertisements}) => {
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
                  <div className="col-md-6 mb-2">
                    <strong>
                      <BiCalendar className="me-1"/>
                      시작일:
                    </strong>{" "}
                    {formatDateTime(ad.startDateTime)}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>
                      <BiCalendar className="me-1"/>
                      종료일:
                    </strong>{" "}
                    {formatDateTime(ad.endDateTime)}
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
                      style={{maxHeight: "300px", objectFit: "contain"}}
                    />
                    {imageSize.width > 0 && (
                      <div className="text-muted mt-2 small">
                        이미지 크기: {imageSize.width} × {imageSize.height} px
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="col-12">
              <div className="bg-white rounded shadow-sm p-3">
                <strong>
                  <BiLinkExternal className="me-1"/>
                  링크:
                </strong>{" "}
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                  {ad.linkUrl}
                </a>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdvertisementModal;
