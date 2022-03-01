import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const Registration = () => {
  return (
    <Wrapper>
      <h1>사장님 가입 신청</h1>
    </Wrapper>
  );
};

export default Registration;
