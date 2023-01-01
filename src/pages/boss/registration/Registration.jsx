import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

import { CommonApi, RegistrationApi } from 'apis';
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
  const [size] = useState(30);
  const [isChanged, setChanged] = useState(false);
  const [registrations, setRegistrations] = useRecoilState(RegistrationsState);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [selectedRejectReason, setSelectedRejectReason] = useState('');

  const onClickApproveButton = async (registrationId) => {
    if (!window.confirm('정말 승인하시겠습니다? ')) {
      return;
    }
    try {
      await RegistrationApi.approveRegistration(registrationId);
      alert('승인되었습니다');
      setChanged(!isChanged);
      setSelectedRejectReason('');
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
        setSelectedRejectReason('');
      } else {
        alert(error.response.data.message);
        setSelectedRejectReason('');
      }
    }
  };

  const onClickRejectButton = async (registrationId) => {
    if (!window.confirm('정말 반려하시겠습니다? ')) {
      return;
    }
    try {
      await RegistrationApi.rejectRegistration(registrationId, selectedRejectReason);
      alert('반려되었습니다');
      setChanged(!isChanged);
      setSelectedRejectReason('');
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
        setSelectedRejectReason('');
      } else {
        alert(error.response.data.message);
        setSelectedRejectReason('');
      }
    }
  };

  useEffect(async () => {
    try {
      const { data } = await CommonApi.getEnums();
      setRejectReasons(data.data.BoosRegistrationRejectReasonType);

      const response = await RegistrationApi.getRegistrations('', size);
      setRegistrations(response.data.data.contents.map((registration) => RegistrationResponse(registration)));
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  }, [isChanged]);

  const onChangeRejectReason = (value) => {
    setSelectedRejectReason(value);
  };

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
            <ItemContent>{registration.store.name}</ItemContent>

            <ItemTitle>가게 카테고리</ItemTitle>
            <ItemContent>{registration.store.categories.join(', ')}</ItemContent>

            <ItemTitle>가게 신청 일자</ItemTitle>
            <ItemContent>{registration.createdAt}</ItemContent>

            <ItemTitle>반려 사유(반려인 경우에만 선택해주세요)</ItemTitle>
            <select name="reaons" onChange={(e) => onChangeRejectReason(e.target.value)} value={selectedRejectReason}>
              <option value="">반려 사유를 선택해주세요</option>
              {rejectReasons.map((reason) => {
                return <option value={reason.key}>{reason.description}</option>;
              })}
            </select>

            <Button onClick={() => onClickApproveButton(registration.registrationId)} type="button">
              승인하기
            </Button>
            <Button onClick={() => onClickRejectButton(registration.registrationId)} type="button">
              반려하기
            </Button>
          </Item>
        );
      })}
    </Wrapper>
  );
};

export default Registration;
