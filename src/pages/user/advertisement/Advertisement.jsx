import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Modal,
  TextField,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { AdvertisementApi } from 'apis';

const Wrapper = styled.div`
  height: 80vh;
`;

const Paper = styled.div`
  position: absolute;
  width: 500px;
  height: 700px;
  top: 50%;
  left: 50%;
  background-color: white;
  transform: translate(-50%, -50%);
  border: 1px solid black;
`;

const AddModal = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [advertisements, setAdvertisements] = useState([]);
  const [totalCounts, setTotalCounts] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const handleClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    fetchAdvertisement();
  }, [page]);

  const fetchAdvertisement = async () => {
    try {
      const { data } = await AdvertisementApi.getAdvertisements(page + 1, size);
      const { totalCounts, contents } = data.data;
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
      <Modal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper>
          <AddModal>
            <h2>광고 추가</h2>
            <TextField label="제목" variant="outlined" />
            <TextField
              label="서브 제목"
              minRows={2}
              maxRows={2}
              multiline
              variant="outlined"
            />
            <TextField type="url" label="링크 URL" variant="outlined" />
            <TextField
              label="시작 날짜"
              type="datetime-local"
              defaultValue="2022-01-01T00:00"
            />
            <TextField
              label="종료 날짜"
              type="datetime-local"
              defaultValue="2022-01-01T00:00"
            />
            <InputLabel id="advertisement-platform">플랫폼</InputLabel>
            <Select labelId="advertisement-platform">
              <MenuItem value="ALL">모든 플랫폼</MenuItem>
              <MenuItem value="AOS">AOS</MenuItem>
              <MenuItem value="IOS">IOS</MenuItem>
            </Select>
            <InputLabel id="advertisement-position">광고 위치</InputLabel>
            <Select labelId="advertisement-position">
              <MenuItem value="SPLASH">스플래시 배너</MenuItem>
              <MenuItem value="MAIN_PAGE_CARD">메인 페이지 가게 카드</MenuItem>
              <MenuItem value="STORE_CATEGORY_LIST">가게 카테고리</MenuItem>
              <MenuItem value="MENU_CATEGORY_BANNER">메뉴 카테고리</MenuItem>
            </Select>
            <TextField type="color" label="폰트 색상" variant="outlined" />
            <TextField type="color" label="배경 색상" variant="outlined" />
          </AddModal>

          <Button color="primary">광고 추가하기</Button>
        </Paper>
      </Modal>
    </Wrapper>
  );
};

export default Advertisement;
