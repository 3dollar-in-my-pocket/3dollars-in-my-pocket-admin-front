import {FormEvent, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeMarkerApi from '@/api/storeMarkerApi';
import {StoreMarker, StoreMarkerRequest} from '@/types/storeMarker';
import uploadApi from '@/api/uploadApi';

interface Props {
  show: boolean;
  mode: 'create' | 'update';
  targetIds: number[];
  initialMarker?: StoreMarker | null;
  onHide: () => void;
  onSuccess: () => void;
}

const emptyForm = {
  groupId: '', selectedUrl: '', selectedWidth: '40', selectedHeight: '40',
  unselectedUrl: '', unselectedWidth: '32', unselectedHeight: '32',
  startDateTime: '', endDateTime: ''
};

const toLocal = (value?: string) => value ? value.slice(0, 16) : '';
const toApi = (value: string) => value.length === 16 ? `${value}:00` : value;

const BulkMarkerFormModal = ({show, mode, targetIds, initialMarker, onHide, onSuccess}: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<'selectedUrl' | 'unselectedUrl' | null>(null);

  useEffect(() => {
    if (!show) return;
    setForm(initialMarker ? {
      groupId: initialMarker.groupId || '',
      selectedUrl: initialMarker.selectedMarkerImage?.imageUrl || '',
      selectedWidth: String(initialMarker.selectedMarkerImage?.width || 40),
      selectedHeight: String(initialMarker.selectedMarkerImage?.height || 40),
      unselectedUrl: initialMarker.unselectedMarkerImage?.imageUrl || '',
      unselectedWidth: String(initialMarker.unselectedMarkerImage?.width || 32),
      unselectedHeight: String(initialMarker.unselectedMarkerImage?.height || 32),
      startDateTime: toLocal(initialMarker.period?.startDateTime),
      endDateTime: toLocal(initialMarker.period?.endDateTime)
    } : emptyForm);
  }, [show, initialMarker]);

  const change = (key: keyof typeof form, value: string) => setForm(prev => ({...prev, [key]: value}));

  const uploadImage = async (field: 'selectedUrl' | 'unselectedUrl', file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('이미지 파일만 업로드 가능합니다.');
    if (file.size > 10 * 1024 * 1024) return toast.error('파일 크기는 10MB 이하여야 합니다.');
    setUploadingField(field);
    try {
      const response = await uploadApi.uploadImage('ADVERTISEMENT_IMAGE', file);
      if (response.ok && response.data) {
        change(field, response.data);
        toast.success('이미지가 업로드되었습니다.');
      }
    } finally { setUploadingField(null); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (targetIds.length < 1 || targetIds.length > 30) return;
    if (form.endDateTime < form.startDateTime) {
      toast.warning('종료 일시는 시작 일시보다 빠를 수 없습니다.');
      return;
    }
    const request: StoreMarkerRequest = {
      groupId: form.groupId.trim(),
      selectedMarkerImage: {url: form.selectedUrl.trim(), width: Number(form.selectedWidth), height: Number(form.selectedHeight)},
      unselectedMarkerImage: {url: form.unselectedUrl.trim(), width: Number(form.unselectedWidth), height: Number(form.unselectedHeight)},
      startDateTime: toApi(form.startDateTime), endDateTime: toApi(form.endDateTime)
    };
    setSubmitting(true);
    try {
      if (mode === 'create') {
        const response = await storeMarkerApi.createStoreMarkersBulk({storeIds: targetIds, ...request});
        if (!response.ok) return;
        toast.success(`마커 ${response.data?.markers?.length ?? 0}개가 생성되었습니다.`);
      } else {
        const response = await storeMarkerApi.updateStoreMarkersBulk({markerIds: targetIds, ...request});
        if (!response.ok) return;
        toast.success('선택한 마커 수정 요청이 완료되었습니다.');
      }
      onSuccess();
      onHide();
    } finally {
      setSubmitting(false);
    }
  };

  return <Modal show={show} onHide={submitting || uploadingField ? undefined : onHide} centered size="lg" scrollable className="app-modal" backdrop={submitting || uploadingField ? 'static' : true}>
    <form onSubmit={submit}>
      <Modal.Header closeButton><Modal.Title>{mode === 'create' ? '마커 일괄 생성' : '마커 일괄 수정'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="alert alert-info py-2">선택한 {targetIds.length}개 대상에 동일한 설정을 적용합니다.</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">그룹 ID</label><input className="form-control" required maxLength={50} value={form.groupId} onChange={e => change('groupId', e.target.value)}/></div>
          <div className="col-12 col-md-6"><ImageFields title="선택 마커 이미지" prefix="selected" form={form} change={change} uploadingField={uploadingField} uploadImage={uploadImage}/></div>
          <div className="col-12 col-md-6"><ImageFields title="미선택 마커 이미지" prefix="unselected" form={form} change={change} uploadingField={uploadingField} uploadImage={uploadImage}/></div>
          <div className="col-12 col-md-6"><label className="form-label">노출 시작</label><input type="datetime-local" className="form-control" required value={form.startDateTime} onChange={e => change('startDateTime', e.target.value)}/></div>
          <div className="col-12 col-md-6"><label className="form-label">노출 종료</label><input type="datetime-local" className="form-control" required value={form.endDateTime} onChange={e => change('endDateTime', e.target.value)}/></div>
        </div>
      </Modal.Body>
      <Modal.Footer><button type="button" className="btn btn-outline-secondary" onClick={onHide} disabled={submitting || Boolean(uploadingField)}>취소</button><button className="btn btn-primary" disabled={submitting || Boolean(uploadingField)}>{submitting ? '처리 중...' : uploadingField ? '업로드 중...' : `${targetIds.length}개 적용`}</button></Modal.Footer>
    </form>
  </Modal>;
};

const ImageFields = ({title, prefix, form, change, uploadingField, uploadImage}: {title: string; prefix: 'selected' | 'unselected'; form: typeof emptyForm; change: (key: keyof typeof emptyForm, value: string) => void; uploadingField: 'selectedUrl' | 'unselectedUrl' | null; uploadImage: (field: 'selectedUrl' | 'unselectedUrl', file: File) => void}) => {
  const urlField = `${prefix}Url` as 'selectedUrl' | 'unselectedUrl';
  return <div className="h-100"><label className="form-label">{title}</label>
    <div className="input-group"><input type="url" className="form-control" required value={form[urlField]} placeholder="https://example.com/marker.png" onChange={e => change(urlField, e.target.value)}/><label className="btn btn-outline-primary mb-0">{uploadingField === urlField ? '업로드 중...' : '파일 선택'}<input type="file" accept="image/*" hidden disabled={Boolean(uploadingField)} onChange={e => { const file = e.target.files?.[0]; if (file) uploadImage(urlField, file); e.target.value = ''; }}/></label></div>
    <div className="marker-preview marker-preview--lg mt-3"><div className="marker-preview__frame marker-preview__frame--checker">{form[urlField] ? <img src={form[urlField]} alt={`${title} 미리보기`}/> : <i className="bi bi-image text-body-tertiary"/>}</div><span className="marker-preview__title">미리보기</span></div>
    <div className="row g-2 mt-2"><div className="col-6"><label className="form-label">가로(px)</label><input type="number" min="1" className="form-control" required value={form[`${prefix}Width`]} onChange={e => change(`${prefix}Width`, e.target.value)}/></div><div className="col-6"><label className="form-label">세로(px)</label><input type="number" min="1" className="form-control" required value={form[`${prefix}Height`]} onChange={e => change(`${prefix}Height`, e.target.value)}/></div></div>
  </div>;
};

export default BulkMarkerFormModal;
