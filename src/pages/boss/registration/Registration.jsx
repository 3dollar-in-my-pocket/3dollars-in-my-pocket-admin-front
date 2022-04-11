import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RegistrationApi } from 'apis';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100vw;
`;

const Item = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 20px;
  border: 1px solid black;
  padding: 16px;
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
  const [registrations, setRegistrations] = useState([
    {
      registrationId: '',
      boss: {
        socialType: '',
        name: '',
        businessNumber: '',
      },
      store: {
        name: '',
        categories: [],
        contactsNumber: '',
        certificationPhotoUrl: '',
      },
      createdAt: '',
    },
  ]);

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
      setRegistrations(response.data.data);
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
              <h3>가입자 정보 {registration.registrationId}</h3>
              <div>
                <th>소셜정보</th>
                <td>{registration.boss.socialType}</td>
              </div>
              <div>
                <th>사장님 성함</th>

                <td>{registration.boss.name}</td>
              </div>
              <div>
                <th>사업자 번호</th>
                <td>{registration.boss.businessNumber}</td>
              </div>
              <div>
                <th>가게 이름</th>
                <td>{registration.boss.name}</td>
              </div>
              <div>
                <th>가게 연락처</th>
                <td>{registration.store.contactsNumber}</td>
              </div>
              <div>
                <th>가게 인증 사진</th>
                <td>
                  <img
                    width="200px"
                    src={registration.store.certificationPhotoUrl}
                  />
                </td>
              </div>
              <div>
                <th>가게 카테고리</th>
                <td>{registration.store.categories.join(', ')}</td>
              </div>
              <div>
                <th>가게 신청 일자</th>
                <td>{registration.createdAt}</td>
              </div>
              <Button
                onClick={() => onClickApproveBtn(registration.registrationId)}
                type="button"
              >
                승인하기
              </Button>
              <Button
                onClick={() => onClickRejectBtn(registration.registrationId)}
                type="button"
              >
                반려하기
              </Button>
            </Item>
          );
        })}
      </table>
    </Wrapper>
  );
};

export default Registration;
