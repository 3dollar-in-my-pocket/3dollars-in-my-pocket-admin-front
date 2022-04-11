import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { AdvertisementApi } from 'apis';
import AddAdvertisementModal from 'components/advertisement/AddAdvertisementModal';
import { useRecoilState } from 'recoil';
import { AdvertisementsState, AdvertisementTotalCounts } from 'stores';
import { AdvertisementsWithPageResponse } from 'apis/dto/response/AdvertisementsResponse';

const Wrapper = styled.div`
  height: 80vh;
`;

const columns = [
  {
    field: 'advertisementId',
    headerName: '-',
    width: 100,
  },
  {
    field: 'title',
    headerName: '제목',
    width: 300,
    editable: true,
  },
  {
    field: 'subTitle',
    headerName: '서브제목',
    width: 500,
    editable: true,
  },
  {
    field: 'platformType',
    headerName: '플랫폼',
    width: 150,
    editable: true,
  },
  {
    field: 'positionType',
    headerName: '광고 위치',
    width: 200,
    editable: true,
  },
  {
    field: 'linkUrl',
    headerName: '링크',
    width: 500,
    editable: true,
  },
  {
    field: 'startDateTime',
    headerName: '시작 날짜',
    width: 200,
    editable: true,
  },
  {
    field: 'bgColor',
    headerName: '배경색상',
    width: 100,
    editable: true,
  },
  {
    field: 'fontColor',
    headerName: '폰트 색상',
    width: 100,
    editable: true,
  },
  {
    field: 'endDateTime',
    headerName: '종료 날짜',
    width: 200,
    editable: true,
  },
  {
    field: 'createdAt',
    headerName: '생성일자',
    width: 200,
  },
  {
    field: 'updatedAt',
    headerName: '최근 수정일자',
    width: 200,
  },
];

const Advertisement = () => {
  const [advertisements, setAdvertisements] = useRecoilState(AdvertisementsState);
  const [totalCounts, setTotalCounts] = useRecoilState(AdvertisementTotalCounts);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAdvertisement();
  }, [page, modalOpen]);

  const fetchAdvertisement = async () => {
    try {
      const response = await AdvertisementApi.getAdvertisements(page + 1, size);
      const { totalCounts, contents } = AdvertisementsWithPageResponse(response.data.data);
      setTotalCounts(totalCounts);
      setAdvertisements(contents);
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  };

  return (
    <Wrapper>
      <h1>Advertisement</h1>
      <Button onClick={() => setModalOpen(true)}>광고 추가</Button>
      <DataGrid
        page={page}
        rows={advertisements}
        columns={columns}
        rowCount={totalCounts}
        pageSize={size}
        paginationMode="server"
        getRowId={(row) => row.advertisementId}
        onPageChange={(newPage) => setPage(newPage)}
      />
      <AddAdvertisementModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </Wrapper>
  );
};

export default Advertisement;
