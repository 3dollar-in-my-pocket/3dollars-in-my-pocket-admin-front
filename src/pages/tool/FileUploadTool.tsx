import React, {useEffect, useRef, useState} from 'react';
import UploadApi from "@/api/uploadApi";
import enumApi from "@/api/enumApi";
import {toast} from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";

const FileUpload = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  /** 업로드 전 로컬 미리보기용 objectURL */
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [fileImageUrl, setFileImageUrl] = useState(null);
  const [imageTypes, setImageTypes] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedImageType(e.target.value);

  const handleFileUpload = () => fileInputRef.current.click();

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCopySuccess(false);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedImageType) {
      toast.warn('이미지 타입을 선택해주세요.');
      return;
    }

    if (selectedFile) {
      setIsLoading(true);
      try {
        const response = await UploadApi.uploadImage(selectedImageType, selectedFile);
        setFileImageUrl(response.data);
        toast.info('파일 업로드가 완료되었습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyUrl = async () => {
    if (!fileImageUrl) return;

    try {
      await navigator.clipboard.writeText(fileImageUrl);
      setCopySuccess(true);
      toast.info('URL이 복사되었습니다.');
    } catch {
      toast.error('URL 복사에 실패했습니다. 주소를 직접 선택해 복사해주세요.');
    }
  };

  const handleReset = () => {
    if (!window.confirm('정말로 초기화 하시겠습니까?')) return;

    setSelectedFile(null);
    setFileImageUrl(null);
    setCopySuccess(false);
    setSelectedImageType('');
  };

  // 선택한 파일의 objectURL 생성/해제
  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    enumApi.getEnum().then((response) => {
      if (response.ok) {
        setImageTypes(response.data['ImageFileType']);
      }
    });
  }, []);

  return (
    <div>
      <PageHeader description="이미지 타입을 선택해 파일을 업로드하고, 발급된 URL을 복사해 사용합니다."/>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <SectionCard title="이미지 업로드" icon="bi-cloud-arrow-up-fill">
            <div className="form-field">
              <label className="form-field__label" htmlFor="image-type">
                <i className="bi bi-collection"/>
                이미지 타입
                <span className="form-required">*</span>
              </label>
              <select
                id="image-type"
                className="form-select"
                disabled={!!fileImageUrl}
                value={selectedImageType}
                onChange={handleImageTypeChange}
              >
                <option value="">이미지 타입을 선택하세요</option>
                {imageTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.description}
                  </option>
                ))}
              </select>
            </div>

            {!fileImageUrl && (
              <div className="form-field">
                <span className="form-field__label">
                  <i className="bi bi-file-earmark-image"/>
                  파일 선택
                </span>
                <input
                  multiple
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{display: 'none'}}
                  onChange={handleFileChange}
                />
                {selectedFile ? (
                  <div className="form-image">
                    <img
                      src={localPreviewUrl}
                      alt="선택한 이미지"
                      className="form-image__thumb"
                    />
                    <span className="form-image__info">{selectedFile.name}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleFileUpload}>
                      <i className="bi bi-arrow-repeat me-1"/>
                      변경
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-outline-primary w-100" onClick={handleFileUpload}>
                    <i className="bi bi-folder2-open me-1"/>
                    파일 선택하기
                  </button>
                )}
                <p className="form-field__hint">JPG, PNG 등 이미지 파일을 업로드할 수 있습니다.</p>
              </div>
            )}

            {fileImageUrl && (
              <div className="form-field">
                <span className="form-field__label">
                  <i className="bi bi-check-circle-fill text-success"/>
                  업로드 완료
                </span>
                <div className="text-center mb-2">
                  <img
                    src={fileImageUrl}
                    alt="업로드된 이미지"
                    className="img-fluid rounded"
                    style={{maxHeight: '320px'}}
                  />
                </div>
                <div className="form-code form-code--done d-block">{fileImageUrl}</div>
              </div>
            )}

            <div className="form-actions">
              {(selectedFile || fileImageUrl) && (
                <button className="btn btn-outline-danger" onClick={handleReset}>
                  <i className="bi bi-arrow-counterclockwise me-1"/>
                  초기화
                </button>
              )}
              {fileImageUrl ? (
                <button className="btn btn-success" onClick={handleCopyUrl} disabled={copySuccess}>
                  <i className={`bi ${copySuccess ? 'bi-check-lg' : 'bi-link-45deg'} me-1`}/>
                  {copySuccess ? 'URL 복사 완료' : 'URL 복사'}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleProcessFile}
                  disabled={isLoading || !selectedFile || !selectedImageType}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up me-1"/>
                      업로드
                    </>
                  )}
                </button>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
