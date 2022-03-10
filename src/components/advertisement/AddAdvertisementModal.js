import React from 'react';
import styled from 'styled-components';
import {
  Button,
  Modal,
  TextField,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';

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

const AddAdvertisementModal = ({ modalOpen, setModalOpen }) => {
  const handleClose = () => {
    setModalOpen(false);
  };

  return (
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
  );
};

export default AddAdvertisementModal;
