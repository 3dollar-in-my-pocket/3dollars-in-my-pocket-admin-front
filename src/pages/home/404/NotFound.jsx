import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const Text = styled.p`
  font-size: 2rem;
  opacity: 0.6;
  margin: 3rem 0;
`;

const BackButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60%;
  border: 3px solid black;
  border-radius: 28px;
  padding: 10px 40px;
  font-weight: bold;
  font-size: 20px;
  background-color: white;
  color: black;
  cursor: pointer;
  &:hover {
    background-color: black;
    color: white;
  }
`;

const NotFound = () => {
  const history = useHistory();
  return (
    <Wrapper>
      <Text>404 Not Found</Text>
      <BackButton onClick={() => history.goBack()}>Go to Back</BackButton>
    </Wrapper>
  );
};

export default NotFound;
