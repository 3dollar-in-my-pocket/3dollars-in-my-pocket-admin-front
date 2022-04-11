import React, { useEffect } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import localStorageService from 'services/LocalStorageService';
import { AuthApi } from 'apis';
import { AUTH_TOKEN } from 'constants/authtoken';
import { useRecoilState } from 'recoil';
import { MyAdminInfoState } from 'stores';
import { MyAdminInfoResponse } from 'apis/dto/response/MyAdminInfoResponse';

const useStyles = makeStyles((theme) => ({
  large: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    marginBottom: theme.spacing(8),
  },
  button: {
    marginTop: theme.spacing(4),
    width: '80%',
    maxWidth: '600px',
  },
  major: {
    width: '80%',
    maxWidth: '600px',
    marginBottom: '20px',
  },
}));

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const InputBox = styled.input`
  border: none;
  padding: 15px 0px;
  width: 80%;
  max-width: 600px;
  font-size: 1rem;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease-in-out;
  &:focus {
    border-color: #4051b5;
  }
`;

const MyPage = () => {
  const classes = useStyles();
  const [admin, setAdmin] = useRecoilState(MyAdminInfoState);
  const history = useHistory();

  useEffect(async () => {
    try {
      const response = await AuthApi.getAdminInfo();
      setAdmin(MyAdminInfoResponse(response.data.data));
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  }, []);

  const onClickLogoutButton = () => {
    localStorageService.delete(AUTH_TOKEN);
    alert('로그아웃 되었습니다');
    history.push('/');
  };

  return (
    <Wrapper>
      <h3>관리자 정보</h3>
      <InputBox type="text" placeholder="이메일" value={admin.email} />
      <InputBox type="text" placeholder="이름" value={admin.name} />
      <Button variant="contained" className={classes.button} onClick={onClickLogoutButton}>
        로그아웃
      </Button>
    </Wrapper>
  );
};

export default MyPage;
