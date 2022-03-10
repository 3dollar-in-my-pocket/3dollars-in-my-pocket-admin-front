import React, { useState } from 'react';
import styled from 'styled-components';
import { DataGrid } from '@material-ui/data-grid';

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

const Registration = () => {
  const [registrations] = useState([]);
  const [totalCounts] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  return (
    <Wrapper>
      <h1>사장님 가입 신청</h1>
      <DataGrid
        page={page}
        rows={registrations}
        columns={columns}
        rowCount={totalCounts}
        pageSize={size}
        paginationMode="server"
        getRowId={(row) => row.advertisementId}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </Wrapper>
  );
};

export default Registration;
