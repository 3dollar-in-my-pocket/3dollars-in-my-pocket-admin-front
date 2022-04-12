import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RegistrationApi } from 'apis';
import { useRecoilState } from 'recoil';
import { RegistrationsState } from 'stores';
import { RegistrationResponse } from 'apis/dto/response';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100vw;
`;

const Item = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 28px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 48px;
`;

const ItemTitle = styled.div`
  display: flex;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: rgba(0, 0, 0, 1);
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  padding: 8px;
`;

const ItemContent = styled.div`
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.8);
  white-space: pre;
  margin: 16px;
`;

const ButtonList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px;
  font-size: 16px;
`;

const Registration = () => {
  const [isChanged, setChanged] = useState(false);
  const [registrations, setRegistrations] = useRecoilState(RegistrationsState);

  const onClickApproveBtn = async (registrationId) => {
    if (!window.confirm('정말 승인하시겠습니다? ')) {
      return;
    }
    try {
      await RegistrationApi.approveRegistration(registrationId);
      alert('승인되었습니다');
      setChanged(!isChanged);
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  };

  const onClickRejectBtn = async (registrationId) => {
    if (!window.confirm('정말 반려하시겠습니다? ')) {
      return;
    }
    try {
      await RegistrationApi.rejectRegistration(registrationId);
      alert('반려되었습니다');
      setChanged(!isChanged);
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  };

  useEffect(async () => {
    try {
      const response = await RegistrationApi.getRegistrations();
      setRegistrations(response.data.data.map((registration) => RegistrationResponse(registration)));
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  }, [isChanged]);

  return (
    <Wrapper>
      <h1>사장님 가입 신청</h1>
      <table>
        {registrations.map((registration) => {
          return (
            <Item>
              <ItemTitle>소셜정보</ItemTitle>
              <ItemContent>{registration.boss.socialType}</ItemContent>
              <ItemTitle>사장님 성함</ItemTitle>

              <ItemContent>{registration.boss.name}</ItemContent>
              <ItemTitle>사업자 번호</ItemTitle>
              <ItemContent>{registration.boss.businessNumber}</ItemContent>
              <ItemTitle>가게 이름</ItemTitle>
              <ItemContent>{registration.boss.name}</ItemContent>
              <ItemTitle>가게 연락처</ItemTitle>
              <ItemContent>{registration.store.contactsNumber}</ItemContent>
              <ItemTitle>가게 인증 사진</ItemTitle>
              <ItemContent>
                <img width="200px" src={registration.store.certificationPhotoUrl} />
              </ItemContent>
              <ItemTitle>가게 카테고리</ItemTitle>
              <ItemContent>{registration.store.categories.join(', ')}</ItemContent>
              <ItemTitle>가게 신청 일자</ItemTitle>
              <ItemContent>{registration.createdAt}</ItemContent>
              <ButtonList>
                <Button onClick={() => onClickApproveBtn(registration.registrationId)} type="button">
                  승인하기
                </Button>
                <Button onClick={() => onClickRejectBtn(registration.registrationId)} type="button">
                  반려하기
                </Button>
              </ButtonList>
            </Item>
          );
        })}
      </table>
    </Wrapper>
  );
};

export default Registration;
