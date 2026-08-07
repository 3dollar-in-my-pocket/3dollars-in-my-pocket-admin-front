import {getPushTypeStyles} from "@/utils/pushUtils";

interface PushPreviewProps {
  title?: string;
  body?: string;
  path?: string;
  /** SIMPLE | SIMPLE_MARKETING (미선택 시 빈 문자열) */
  pushType?: string;
  imageUrl?: string;
}

const PushPreview = ({title, body, path, pushType, imageUrl}: PushPreviewProps) => {
  const styles = getPushTypeStyles(pushType);

  return (
    <div className="col-12 col-lg-5 d-flex justify-content-center align-items-center mb-4 mb-lg-0">
      <div
        style={{
          width: "300px",
          height: "550px",
          backgroundColor: "#000",
          borderRadius: "25px",
          padding: "8px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
          position: "relative"
        }}
      >
        {/* Phone Screen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a1a",
            borderRadius: "18px",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* Status Bar */}
          <div
            style={{
              height: "30px",
              backgroundColor: "#000",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 15px",
              fontSize: "12px",
              color: "#fff",
              fontWeight: "500"
            }}
          >
            <span>9:41</span>
            <span>🔋 100%</span>
          </div>

          {/* Notification Area */}
          <div
            style={{
              backgroundColor: styles.backgroundColor,
              margin: "10px",
              borderRadius: "12px",
              padding: "15px",
              border: `1px solid ${styles.borderColor}`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
            }}
          >
            {/* App Icon and Name */}
            <div className="d-flex align-items-center mb-2">
              <img
                src="/favicon.ico"
                alt="가슴속 3천원"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  marginRight: "8px",
                  objectFit: "cover"
                }}
              />
              <span style={{color: "#fff", fontSize: "13px", fontWeight: "500"}}>
                가슴속 3천원{styles.appNameSuffix}
              </span>
              <span style={{color: "#8e8e93", fontSize: "12px", marginLeft: "auto"}}>
                지금
              </span>
            </div>

            {/* Notification Content */}
            <div style={{color: "#fff"}}>
              {/* Image Section */}
              {imageUrl && (
                <div style={{
                  marginBottom: "12px",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <img
                    src={imageUrl}
                    alt="푸시 이미지"
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
              )}

              <div style={{
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "4px",
                lineHeight: "1.3"
              }}>
                {title || "푸시 제목이 여기에 표시됩니다"}
              </div>
              <div style={{
                fontSize: "14px",
                color: "#d1d1d6",
                lineHeight: "1.4"
              }}>
                {body || "푸시 메시지 내용이 여기에 표시됩니다. 사용자가 입력한 내용을 실시간으로 확인할 수 있습니다."}
              </div>
              {path && (
                <div style={{
                  fontSize: "12px",
                  color: "#007AFF",
                  marginTop: "8px",
                  padding: "4px 8px",
                  backgroundColor: "rgba(0, 122, 255, 0.1)",
                  borderRadius: "4px",
                  display: "inline-block"
                }}>
                  📱 {path}
                </div>
              )}
            </div>
          </div>

          {/* Background Apps */}
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#8e8e93",
            fontSize: "11px",
            textAlign: "center"
          }}>
            탭하여 앱에서 보기
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushPreview;
