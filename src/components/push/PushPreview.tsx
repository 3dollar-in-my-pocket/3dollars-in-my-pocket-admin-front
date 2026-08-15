import {getPushTypeStyles} from "@/utils/pushUtils";

interface PushPreviewProps {
  title?: string;
  body?: string;
  path?: string;
  /** SIMPLE | SIMPLE_MARKETING (미선택 시 빈 문자열) */
  pushType?: string;
  imageUrl?: string;
}

/**
 * 푸시 알림 미리보기 (단말 목업)
 * 폭은 부모가 결정하며, 내부 요소는 목업 폭에 비례해 축소된다.
 */
const PushPreview = ({title, body, path, pushType, imageUrl}: PushPreviewProps) => {
  const styles = getPushTypeStyles(pushType);

  return (
    <div className="push-phone">
      <div className="push-phone__screen">
        <div className="push-phone__statusbar">
          <span>9:41</span>
          <span className="push-phone__statusbar-icons">
            <i className="bi bi-wifi"/>
            <i className="bi bi-battery-full"/>
          </span>
        </div>

        <div
          className="push-phone__notification"
          style={{
            backgroundColor: styles.backgroundColor,
            border: `1px solid ${styles.borderColor}`
          }}
        >
          <div className="push-phone__app">
            <img src="/favicon.png" alt="" className="push-phone__app-icon"/>
            <span className="push-phone__app-name">
              가슴속 3천원{styles.appNameSuffix}
            </span>
            <span className="push-phone__app-time">지금</span>
          </div>

          {imageUrl && (
            <div className="push-phone__image">
              <img src={imageUrl} alt="푸시 이미지"/>
            </div>
          )}

          <div className="push-phone__title">
            {title || "푸시 제목이 여기에 표시됩니다"}
          </div>
          <div className="push-phone__body">
            {body || "푸시 메시지 내용이 여기에 표시됩니다."}
          </div>
          {path && (
            <div className="push-phone__path">
              <i className="bi bi-box-arrow-up-right me-1"/>
              {path}
            </div>
          )}
        </div>

        <div className="push-phone__hint">탭하여 앱에서 보기</div>
      </div>
    </div>
  );
};

export default PushPreview;
