export const REPORT_REASON = {
  'NOSTORE': 'NOSTORE',
  'WRONGPOSITION': 'WRONGPOSITION',
  'OVERLAPSTORE': 'OVERLAPSTORE',
  'WRONG_CONTENT': 'WRONG_CONTENT'
}

export const getReportReasonBadgeClass = (reason) => {
  switch (reason) {
    case REPORT_REASON.NOSTORE:
      return 'bg-primary';
    case REPORT_REASON.WRONGPOSITION:
      return 'bg-warning';
    case REPORT_REASON.OVERLAPSTORE:
      return 'bg-info';
    case REPORT_REASON.WRONG_CONTENT:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}
