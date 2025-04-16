import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Container, Form, Spinner} from 'react-bootstrap';
import UploadApi from "../../api/uploadApi";
import enumApi from "../../api/enumApi";
import {toast} from "react-toastify";

const FileUpload = () => {
    const fileInputRef = useRef(null);
    const urlTextAreaRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileImageUrl, setFileImageUrl] = useState(null);
    const [imageTypes, setImageTypes] = useState([]);
    const [copySuccess, setCopySuccess] = useState(false);
    const [selectedImageType, setSelectedImageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        if (!selectedImageType) {
            toast.warn('이미지 타입을 선택해주세요.');
            return
        }

        if (selectedFile) {
            setIsLoading(true);
            const response = await UploadApi.uploadImage(selectedImageType, selectedFile);
            setFileImageUrl(response.data);
            toast.info('파일 업로드가 완료되었습니다.');
            setIsLoading(false);
        }
    }

    const handleCopyUrl = () => {
        if (urlTextAreaRef.current) {
            urlTextAreaRef.current.select();
            document.execCommand('copy');
            setCopySuccess(true);
            toast.info('URL이 복사되었습니다.');
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setFileImageUrl(null);
        setCopySuccess(false);
        setSelectedImageType('');
    };

    useEffect(() => {
        enumApi.getEnum().then((response) => {
            if (!response.ok) {
                return;
            }
            setImageTypes(response.data['ImageFileType']);
        });
    }, []);

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">이미지 업로드 및 URL 복사</h2>

            <Card className="p-4 shadow-sm mb-4">
                <Form.Group className="mb-4">
                    <Form.Label>이미지 타입 선택</Form.Label>
                    <Form.Select
                        value={selectedImageType}
                        onChange={handleImageTypeChange}
                        aria-label="이미지 타입 선택"
                    >
                        <option value="">이미지 타입을 선택하세요</option>
                        {imageTypes.map((type) => (
                            <option key={type.key} value={type.key}>
                                {type.description}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <div className="text-center mb-4">
                    {fileImageUrl ? (
                        <>
                            <img
                                src={fileImageUrl}
                                alt="Uploaded"
                                className="img-fluid rounded mb-3"
                                style={{maxHeight: '300px', objectFit: 'cover'}}
                            />
                            <p className="text-muted">{fileImageUrl}</p>
                            <Button
                                variant="success"
                                onClick={handleCopyUrl}
                                disabled={copySuccess}
                                className="w-100"
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
                                style={{display: 'none'}}
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="primary"
                                onClick={handleFileUpload}
                                className="mb-3 w-100"
                            >
                                파일 선택하기
                            </Button>
                        </>
                    )}
                </div>

                {selectedFile && !fileImageUrl && (
                    <div className="d-grid gap-2 mb-3">
                        <Button
                            variant="secondary"
                            onClick={handleProcessFile}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2"/>
                                    처리 중...
                                </>
                            ) : (
                                '파일 업로드 하기'
                            )}
                        </Button>
                    </div>
                )}

                <div className="d-grid gap-2">
                    <Button variant="outline-secondary" onClick={handleReset}>
                        리셋
                    </Button>
                </div>
            </Card>

            <textarea
                ref={urlTextAreaRef}
                value={fileImageUrl}
                style={{position: 'absolute', top: '-1000px', left: '-1000px'}}
                readOnly
            />
        </Container>
    );
};

export default FileUpload;
