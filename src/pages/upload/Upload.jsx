import React, { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { CommonApi, UploadApi } from 'apis';

const FileUpload = () => {
  const fileInputRef = useRef(null);
  const urlTextAreaRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileImageUrl, setFileImageUrl] = useState(null);
  const [imageTypes, setImageTypes] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState('');

  const handleImageTypeChange = (e) => {
    setSelectedImageType(e.target.value);
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCopySuccess(false);
    }
  };

  const handleProcessFile = async () => {
    if (selectedFile) {
      try {
        const response = await UploadApi.upload(selectedImageType, selectedFile);
        setFileImageUrl(response.data.data);
        setCopySuccess(false);
      } catch (error) {
        if (!error.response) {
          alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
        } else {
          alert(error.response.data.message);
        }
      }
    }
  };

  const handleCopyUrl = () => {
    if (urlTextAreaRef.current) {
      urlTextAreaRef.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileImageUrl(null);
    setCopySuccess(false);
  };

  useEffect(async () => {
    try {
      const { data } = await CommonApi.getEnums();
      setImageTypes(data.data.ImageFileType);
    } catch(error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>이미지 업로드 및 URL 복사</h2>
     <Select
          value={selectedImageType}
          onChange={handleImageTypeChange}
          style={{ marginBottom: '20px' }}
        >
          {imageTypes.map((type) => (
            <MenuItem key={type.key} value={type.key}>
              {type.description}
            </MenuItem>
          ))}
        </Select>

      <div>
        {fileImageUrl ? (
          <>
            <img src={fileImageUrl} alt="Uploaded" style={{ maxWidth: '100%', marginTop: '20px' }} />
            <p>{fileImageUrl}</p>
            <Button
              variant="contained"
              color={copySuccess ? 'default' : 'primary'}
              onClick={handleCopyUrl}
            >
              {copySuccess ? 'URL 복사 완료' : 'URL 복사하기'}
            </Button>
          </>
        ) : (
          <>
            <input
              multiple
              type="file"
              accept="image/*" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleFileUpload}
            >
              파일 선택하기
            </Button>
          </>
        )}
      </div>
      {selectedFile && !fileImageUrl && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleProcessFile}
        >
          파일 업로드 하기
        </Button>
      )}
        <Button
          variant="contained"
          color="default"
          onClick={handleReset}
        >
          리셋
        </Button>
      <textarea
        ref={urlTextAreaRef}
        value={fileImageUrl}
        style={{ position: 'absolute', top: '-1000px', left: '-1000px' }}
        readOnly
      />
    </div>
  );
};

export default FileUpload;