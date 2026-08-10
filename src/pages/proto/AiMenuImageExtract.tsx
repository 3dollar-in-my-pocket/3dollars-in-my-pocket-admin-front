import React, {ChangeEvent, useEffect, useMemo, useRef, useState} from 'react';
import {Button, Col, Form, Row, Spinner} from 'react-bootstrap';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import {toast} from 'react-toastify';
import enumApi from '@/api/enumApi';
import storeMenuApi from '@/api/storeMenuApi';
import {StoreMenuExtractResponse} from '@/types/storeMenu';

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
    <div>
      <PageHeader description="메뉴판 사진을 업로드해 AI가 추출한 메뉴 제안값을 확인하고 수정합니다."/>

      {errorMessage && (
        <div className="alert alert-danger py-2" role="alert">
          {errorMessage}
        </div>
      )}

      <Row className="g-3">
        <Col lg={4}>
          <SectionCard title="이미지 업로드" icon="bi-cloud-arrow-up-fill">
              <Form.Group className="form-field">
                <Form.Label className="form-field__label">메뉴판 이미지</Form.Label>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isExtracting}
                  onChange={handleFileChange}
                />
                <Form.Text className="form-field__hint">
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
          </SectionCard>
        </Col>

        <Col lg={8}>
          <SectionCard
            title="추출 결과"
            icon="bi-card-list"
            description="결과는 제안값이며, 저장 전 관리자가 직접 확인해야 합니다."
            aside={<span className="page-count">{menus.length}건</span>}
          >
              {hasInvalidSuggestion && (
                <div className="alert alert-warning py-2" role="alert">
                  이름이 비었거나 수량/가격을 추출하지 못한 항목이 있습니다.
                </div>
              )}

              {menus.length === 0 ? (
                <EmptyState
                  icon="bi-card-list"
                  title="추출된 메뉴가 없습니다"
                  description="메뉴판 이미지를 선택한 뒤 메뉴 추출을 실행해주세요."
                />
              ) : (
                <>
                  <DataTable>
                      <thead>
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
                          <td className="num">{index + 1}</td>
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
                  </DataTable>

                  <div className="mt-4">
                    <div className="detail-field__label mb-2">저장 API 전달 전 확인용 JSON</div>
                    <pre className="bg-light border rounded p-3 small mb-0" style={{maxHeight: 260, overflow: 'auto'}}>
                      {JSON.stringify(menus, null, 2)}
                    </pre>
                  </div>
                </>
              )}
          </SectionCard>
        </Col>
      </Row>
    </div>
  );
};

export default AiMenuImageExtract;
