export const VISIT_TYPE = {
  EXISTS: 'EXISTS',
  NOT_EXISTS: 'NOT_EXISTS',
};

export const getVisitTypeBatchClass = (visitType) => {
  switch (visitType) {
    case VISIT_TYPE.EXISTS:
      return 'bg-success'
    case VISIT_TYPE.NOT_EXISTS:
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

export const getVisitTypeDisplayName = (visitType) => {
  switch (visitType) {
    case VISIT_TYPE.EXISTS:
      return '방문 성공'
    case VISIT_TYPE.NOT_EXISTS:
      return '방문 실패'
    default:
      return '알 수 없음'
  }
}

export const getVisitIconClass = (visitType) => {
  switch (visitType) {
    case VISIT_TYPE.EXISTS:
      return 'bi-check-circle'
    case VISIT_TYPE.NOT_EXISTS:
      return 'bi-x-circle'
    default:
      return 'bi-question-circle'
  }
}
