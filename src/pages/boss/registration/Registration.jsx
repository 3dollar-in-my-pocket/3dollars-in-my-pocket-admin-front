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
  height 100vh;
  overflow-y: auto;
`;

const Item = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 60%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 20px 36px;
  margin: 20px;
`;

const ItemTitle = styled.div`
  display: flex;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 1);
  width: 100%;
  padding: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const ItemContent = styled.div`
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.8);
  white-space: pre;
  margin: 12px;
`;

const Button = styled.button`
  width: 100%;
  margin: 8px 0;
  font-size: 12px;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 24px;
`;

const ItemImageLayer = styled.div`
  display: flex;
  text-align: center;
  justify-content: center;
  margin: 12px;
`;

const ItemImage = styled.img`
  width: 240px;
`;

const Registration = () => {
  const [size] = useState(50);
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

  const containId = (registrationId) => {
    return registrations.some((registration) => registration.registrationId === registrationId);
  };

  useEffect(async () => {
    try {
      const response = await RegistrationApi.getRegistrations('', size);
      const newCursor = response.data.data
        .filter((registration) => !containId(registration.registrationId))
        .map((registration) => RegistrationResponse(registration));
      setRegistrations(registrations.concat(newCursor));
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
      <h2>사장님 가입 신청 관리</h2>
      {registrations.map((registration) => {
        return (
          <Item key={registration.registrationId}>
            <ItemImageLayer>
              <ItemImage src={registration.store.certificationPhotoUrl} />
            </ItemImageLayer>

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

            <ItemTitle>가게 카테고리</ItemTitle>
            <ItemContent>{registration.store.categories.join(', ')}</ItemContent>

            <ItemTitle>가게 신청 일자</ItemTitle>
            <ItemContent>{registration.createdAt}</ItemContent>

            <Button onClick={() => onClickApproveBtn(registration.registrationId)} type="button">
              승인하기
            </Button>
            <Button onClick={() => onClickRejectBtn(registration.registrationId)} type="button">
              반려하기
            </Button>
          </Item>
        );
      })}
    </Wrapper>
  );
};

export default Registration;
