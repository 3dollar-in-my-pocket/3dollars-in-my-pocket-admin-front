import React from 'react';
import styled from 'styled-components';
import {
  Button,
  Modal,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@material-ui/core';
import { useInput } from 'hooks/useInput';
import { toDateTime } from 'utils';
import { AdvertisementApi, UploadApi } from 'apis';

const Paper = styled.div`
  position: absolute;
  width: 500px;
  height: 800px;
  top: 60%;
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
  const [title, onChangeTitle] = useInput(null);
  const [subTitle, onChangeSubTitle] = useInput(null);
  const [linkUrl, onChangeLinkUrl] = useInput(null);
  const [startDateTime, onChangeStartDateTime] = useInput(
    toDateTime(new Date())
  );
  const [endDateTime, onChangeendDateTime] = useInput(toDateTime(new Date()));
  const [platform, onChangePlatform] = useInput('');
  const [position, onChangePosition] = useInput('');

  const [imageUrl, , setImageUrl] = useInput('');
  const [bgColor, onChangeBgColor] = useInput(null);
  const [fontColor, onChangeFontColor] = useInput(null);

  const handleClose = () => {
    setModalOpen(false);
  };

  const uploadFile = async (e) => {
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const response = await UploadApi.upload(formData);
      setImageUrl(response.data.data);
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  };

  const onClickAddAdvertisementButton = async () => {
    try {
      await AdvertisementApi.addAdvertisement({
        bgColor,
        fontColor,
        imageUrl,
        linkUrl,
        platform,
        position,
        startDateTime: toDateTime(new Date(startDateTime)),
        endDateTime: toDateTime(new Date(endDateTime)),
        subTitle,
        title,
      });
      alert('광고를 추가하였습니다');
      setModalOpen(false);
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
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
          <Avatar
            alt="광고 이미지"
            src={imageUrl}
            style={{
              width: '30%',
            }}
          />
          <h2>광고 추가</h2>
          <TextField
            value={title}
            onChange={onChangeTitle}
            label="제목"
            variant="outlined"
          />
          <TextField
            value={subTitle}
            onChange={onChangeSubTitle}
            label="서브 제목"
            minRows={2}
            maxRows={2}
            multiline
            variant="outlined"
          />
          <input accept="image/*" multiple type="file" onChange={uploadFile} />
          <label htmlFor="raised-button-file">
            <Button variant="raised" component="span">
              Upload
            </Button>
          </label>
          <TextField
            value={linkUrl}
            onChange={onChangeLinkUrl}
            type="url"
            label="링크 URL"
            variant="outlined"
          />
          <TextField
            value={startDateTime}
            onChange={onChangeStartDateTime}
            label="시작 날짜"
            type="datetime-local"
            defaultValue="2022-01-01T00:00"
          />
          <TextField
            value={endDateTime}
            onChange={onChangeendDateTime}
            label="종료 날짜"
            type="datetime-local"
            defaultValue="2022-01-01T00:00"
          />
          <InputLabel id="advertisement-platform">플랫폼</InputLabel>
          <Select
            labelId="advertisement-platform"
            value={platform}
            onChange={onChangePlatform}
          >
            <MenuItem value="ALL">모든 플랫폼</MenuItem>
            <MenuItem value="AOS">AOS</MenuItem>
            <MenuItem value="IOS">IOS</MenuItem>
          </Select>
          <InputLabel id="advertisement-position">광고 위치</InputLabel>
          <Select
            labelId="advertisement-position"
            value={position}
            onChange={onChangePosition}
          >
            <MenuItem value="SPLASH">스플래시 배너</MenuItem>
            <MenuItem value="MAIN_PAGE_CARD">메인 페이지 가게 카드</MenuItem>
            <MenuItem value="STORE_CATEGORY_LIST">가게 카테고리</MenuItem>
            <MenuItem value="MENU_CATEGORY_BANNER">메뉴 카테고리</MenuItem>
          </Select>
          <TextField
            value={fontColor}
            onChange={onChangeFontColor}
            type="color"
            label="폰트 색상"
            variant="outlined"
          />
          <TextField
            value={bgColor}
            onChange={onChangeBgColor}
            type="color"
            label="배경 색상"
            variant="outlined"
          />
        </AddModal>

        <Button color="primary" onClick={onClickAddAdvertisementButton}>
          광고 추가하기
        </Button>
      </Paper>
    </Modal>
  );
};

export default AddAdvertisementModal;
