import React from 'react';
import { AiOutlineArrowRight } from 'react-icons/ai';
import styled from 'styled-components';
import { GOOGLE_AUTH_URL } from 'constants';
import { GoogleButton } from 'components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const HomeText = styled.p`
  text-align: center;
  font-size: 24px;
  width: 100%;
  opacity: 0.4;
  margin: 40px 0;
  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const LoginButton = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0px 0px 0px;
  padding: 16px;
  width: 60%;
  max-width: 720px;
  border: 0px solid #ffffff;
  border-radius: 48px;
  background-color: #ffffff;
  box-shadow: 0px 24px 3px -16px #cfcece;
  color: black;
  font-weight: bold;
  text-decoration: none;
  &:hover {
    cursor: pointer;
    border: 2px solid #cfcece;
  }
`;

const LoginButtonText = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px;
  font-size: 24px;
  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const Title = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 16px;
  font-size: 32px;
`;

const Home = () => {
  return (
    <Wrapper>
      <Title>가슴속 3천원 관리자 서비스</Title>
      <HomeText>아래의 구글 버튼을 통해 로그인 후, 서비스를 이용하실 수 있습니다</HomeText>
      <LoginButton href={GOOGLE_AUTH_URL}>
        <GoogleButton />
        <LoginButtonText>구글 계정으로 시작하기</LoginButtonText>
        <AiOutlineArrowRight size="40px" />
      </LoginButton>
    </Wrapper>
  );
};

export default Home;
