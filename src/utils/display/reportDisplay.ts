/**
 * 신고 사유 표시 로직 (배지 클래스)
 *
 * 타입과 상수 정의는 types/report.ts에 있습니다.
 */

import { REPORT_REASON, ReportReasonCode } from '@/types/report';

export const getReportReasonBadgeClass = (reason: ReportReasonCode): string => {
  switch (reason) {
    case REPORT_REASON.NOSTORE:
      return 'bg-primary';
    case REPORT_REASON.WRONGNOPOSITION:
      return 'bg-warning';
    case REPORT_REASON.OVERLAPSTORE:
      return 'bg-info';
    case REPORT_REASON.WRONG_CONTENT:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}
