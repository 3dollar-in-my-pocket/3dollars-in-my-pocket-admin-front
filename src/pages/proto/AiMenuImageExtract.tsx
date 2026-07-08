import React, {ChangeEvent, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table} from 'react-bootstrap';
import {toast} from 'react-toastify';
import enumApi from '../../api/enumApi';
import storeMenuApi from '../../api/storeMenuApi';
import {StoreMenuExtractResponse} from '../../types/storeMenu';

interface EnumOption {
  key: string;
  description: string;
}

const FALLBACK_FOOD_TYPE_OPTIONS: EnumOption[] = [
  {key: 'TTEOKBOKKI', description: '떡볶이'},
  {key: 'SUNDAE', description: '순대'},
  {key: 'FISHCAKE', description: '어묵'},
  {key: 'ODENG', description: '어묵'},
  {key: 'BUNGEOPPANG', description: '붕어빵'},
  {key: 'GUNGOGUMA', description: '군고구마'},
  {key: 'HOTTEOK', description: '호떡'},
  {key: 'EGG_BREAD', description: '계란빵'},
  {key: 'TAKOYAKI', description: '타코야키'},
  {key: 'TOAST', description: '토스트'},
  {key: 'WAFFLE', description: '와플'},
  {key: 'ETC', description: '기타'},
];

const AiMenuImageExtract = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [menus, setMenus] = useState<StoreMenuExtractResponse[]>([]);
  const [foodTypeOptions, setFoodTypeOptions] = useState<EnumOption[]>(FALLBACK_FOOD_TYPE_OPTIONS);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const foodTypeLabelMap = useMemo(() => {
    return foodTypeOptions.reduce<Record<string, string>>((acc, option) => {
      acc[option.key] = option.description;
      return acc;
    }, {});
  }, [foodTypeOptions]);

  const hasInvalidSuggestion = menus.some(menu => !menu.name.trim() || menu.count === null || menu.price === null);

  useEffect(() => {
    enumApi.getEnum().then((response) => {
      if (response?.ok && Array.isArray(response.data?.FoodType)) {
        setFoodTypeOptions(response.data.FoodType);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warn('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setMenus([]);
    setErrorMessage('');
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      toast.warn('메뉴판 이미지를 선택해주세요.');
      return;
    }

    try {
      setIsExtracting(true);
      setErrorMessage('');
      const response = await storeMenuApi.extractMenus(selectedFile);

      if (response.ok) {
        setMenus(response.data || []);
        toast.success('메뉴 추출이 완료되었습니다.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '메뉴 추출 중 오류가 발생했습니다.';
      setErrorMessage(message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setMenus([]);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateMenu = (index: number, field: keyof StoreMenuExtractResponse, value: string) => {
    setMenus(prev => prev.map((menu, menuIndex) => {
      if (menuIndex !== index) return menu;

      if (field === 'count' || field === 'price') {
        return {
          ...menu,
          [field]: value === '' ? null : Number(value),
        };
      }

      return {
        ...menu,
        [field]: value,
      };
    }));
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <div>
          <h2 className="fw-bold mb-2">
            <i className="bi bi-robot me-2 text-primary"></i>
            AI 메뉴 이미지 추출
          </h2>
          <p className="text-muted mb-0">
            메뉴판 사진을 업로드해 AI가 추출한 메뉴 제안값을 확인하고 수정합니다.
          </p>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="danger" className="mb-4">
          {errorMessage}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fw-bold mb-3">이미지 업로드</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">메뉴판 이미지</Form.Label>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isExtracting}
                  onChange={handleFileChange}
                />
                <Form.Text className="text-muted">
                  이미지 분석은 시간이 걸릴 수 있습니다.
                </Form.Text>
              </Form.Group>

              {previewUrl && (
                <div className="border rounded overflow-hidden mb-3 bg-light">
                  <img
                    src={previewUrl}
                    alt="선택한 메뉴판"
                    className="img-fluid w-100"
                    style={{maxHeight: 360, objectFit: 'contain'}}
                  />
                </div>
              )}

              {selectedFile && (
                <div className="small text-muted mb-3">
                  <div className="fw-semibold text-dark">{selectedFile.name}</div>
                  <div>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              )}

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  disabled={!selectedFile || isExtracting}
                  onClick={handleExtract}
                >
                  {isExtracting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2"/>
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-stars me-2"></i>
                      메뉴 추출하기
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  disabled={isExtracting || (!selectedFile && menus.length === 0)}
                  onClick={handleReset}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  초기화
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                <div>
                  <Card.Title className="fw-bold mb-1">추출 결과</Card.Title>
                  <Card.Text className="text-muted mb-0">
                    결과는 제안값이며, 저장 전 관리자가 직접 확인해야 합니다.
                  </Card.Text>
                </div>
                <Badge bg={menus.length > 0 ? 'primary' : 'secondary'} className="align-self-start px-3 py-2">
                  {menus.length}개
                </Badge>
              </div>

              {hasInvalidSuggestion && (
                <Alert variant="warning" className="py-2">
                  이름이 비었거나 수량/가격을 추출하지 못한 항목이 있습니다.
                </Alert>
              )}

              {menus.length === 0 ? (
                <div className="text-center text-muted py-5 border rounded bg-light">
                  <i className="bi bi-card-list fs-1 d-block mb-3"></i>
                  <div className="fw-semibold">추출된 메뉴가 없습니다</div>
                  <div className="small">좌측에서 메뉴판 이미지를 선택한 뒤 메뉴 추출을 실행해주세요.</div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light">
                      <tr>
                        <th style={{width: 64}}>번호</th>
                        <th>메뉴 이름</th>
                        <th style={{width: 120}}>수량</th>
                        <th style={{width: 160}}>가격</th>
                        <th style={{width: 200}}>카테고리</th>
                      </tr>
                      </thead>
                      <tbody>
                      {menus.map((menu, index) => (
                        <tr key={`${menu.name}-${index}`}>
                          <td className="text-muted">{index + 1}</td>
                          <td>
                            <Form.Control
                              value={menu.name}
                              placeholder="메뉴 이름 입력"
                              isInvalid={!menu.name.trim()}
                              onChange={(event) => updateMenu(index, 'name', event.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min={0}
                              value={menu.count ?? ''}
                              placeholder="수량"
                              isInvalid={menu.count === null}
                              onChange={(event) => updateMenu(index, 'count', event.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min={0}
                              step={100}
                              value={menu.price ?? ''}
                              placeholder="가격"
                              isInvalid={menu.price === null}
                              onChange={(event) => updateMenu(index, 'price', event.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Select
                              value={menu.category || 'ETC'}
                              onChange={(event) => updateMenu(index, 'category', event.target.value)}
                            >
                              {foodTypeOptions.map(option => (
                                <option key={option.key} value={option.key}>
                                  {option.description} ({option.key})
                                </option>
                              ))}
                              {!foodTypeLabelMap[menu.category] && menu.category && (
                                <option value={menu.category}>{menu.category}</option>
                              )}
                            </Form.Select>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </Table>
                  </div>

                  <div className="mt-4">
                    <div className="fw-semibold mb-2">저장 API 전달 전 확인용 JSON</div>
                    <pre className="bg-light border rounded p-3 small mb-0" style={{maxHeight: 260, overflow: 'auto'}}>
                      {JSON.stringify(menus, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AiMenuImageExtract;
