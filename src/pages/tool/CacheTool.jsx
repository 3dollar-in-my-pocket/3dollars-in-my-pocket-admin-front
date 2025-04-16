import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, Container, Form, Row, Spinner} from 'react-bootstrap';
import enumApi from "../../api/enumApi";
import cacheToolApi from "../../api/cacheToolApi";
import {toast} from "react-toastify";

const CacheTools = () => {
    const [cacheTypes, setCacheTypes] = useState([]);
    const [selectedCacheType, setSelectedCacheType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const evictCaches = async () => {
        if (!selectedCacheType) {
            setErrorMessage('캐시 타입을 선택해주세요.');
            return;
        }

        if (!window.confirm('정말로 캐시를 제거하겠습니까?')) {
            return;
        }

        try {
            setIsLoading(true);
            await cacheToolApi.evictAll(selectedCacheType);
            toast.info('캐시가 제거되었습니다');
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            if (!error.response) {
                setErrorMessage('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
            } else {
                setErrorMessage(error.response.data.message || '예상치 못한 오류가 발생했습니다.');
            }
        }
    };

    const handleSelectedCache = (e) => {
        setSelectedCacheType(e.target.value);
        setErrorMessage('');
    };

    useEffect(() => {
        enumApi.getEnum()
            .then((response) => {
                if (!response.ok) {
                    return;
                }
                setCacheTypes(response.data['CacheType']);
            });
    }, []);

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">캐시 전체 만료 툴</h2>
                        <p className="text-muted">선택한 캐시 타입을 만료시키는 작업을 진행합니다.</p>
                    </div>

                    {errorMessage && (
                        <Alert variant="danger" className="mb-4">
                            {errorMessage}
                        </Alert>
                    )}

                    <div className="mb-4">
                        <Form.Group controlId="selectCacheType">
                            <Form.Label className="fw-semibold">캐시 타입 선택</Form.Label>
                            <Form.Select
                                value={selectedCacheType}
                                onChange={handleSelectedCache}
                                aria-label="캐시 타입 선택"
                                className="shadow-sm"
                            >
                                <option value="">캐시 타입을 선택하세요</option>
                                {cacheTypes.map((type) => (
                                    <option key={type.key} value={type.key}>
                                        {type.description}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <div className="text-center">
                        <Button
                            variant="danger"
                            onClick={evictCaches}
                            disabled={!selectedCacheType || isLoading}
                            className="btn-lg w-75 shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2"/> 처리 중...
                                </>
                            ) : (
                                '캐시 만료시키기'
                            )}
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default CacheTools;
