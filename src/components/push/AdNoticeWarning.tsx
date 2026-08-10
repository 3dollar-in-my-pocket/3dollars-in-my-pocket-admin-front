import {AD_BODY_SUFFIX, AD_TITLE_PREFIX, AdNoticeStatus} from '@/utils/pushUtils';

interface AdNoticeWarningProps {
  adNotice: AdNoticeStatus;
}

/**
 * 광고성 푸시 법정 표기 누락 경고 (발송 확인 모달용)
 * 발송을 막지는 않으며, 발송 직전 마지막 확인을 위한 안내다.
 */
const AdNoticeWarning = ({adNotice}: AdNoticeWarningProps) => {
  if (!adNotice.hasMissing) return null;

  return (
    <div className="alert alert-warning py-2" role="alert">
      <div className="fw-semibold mb-1">
        <i className="bi bi-shield-exclamation me-1"/>
        광고성 푸시 법정 표기가 누락되었습니다.
      </div>
      <ul className="mb-1 ps-4 small">
        {adNotice.missingTitlePrefix && (
          <li>제목이 <code>{AD_TITLE_PREFIX}</code>로 시작하지 않습니다.</li>
        )}
        {adNotice.missingBodySuffix && (
          <li>본문이 <code>{AD_BODY_SUFFIX}</code>로 끝나지 않습니다.</li>
        )}
      </ul>
      <div className="small mb-0">그래도 발송하시겠습니까?</div>
    </div>
  );
};

export default AdNoticeWarning;
