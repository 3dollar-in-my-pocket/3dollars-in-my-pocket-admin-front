import { FaqResponse } from 'apis/dto/response';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { FaqCategoryResponse } from 'apis/dto/response/FaqResponse';
import { FaqApi } from 'apis';
import { FaqsState, CurrentFaqCategory, FaqCategoriesState } from 'stores';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100vw;
`;

const Item = styled.div`
  display: flex;
  width: 60%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 32px;
`;

const ItemTitle = styled.div`
  display: flex;
  width: 80%;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 1);
  padding: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const ItemContent = styled.div`
  display: flex;
  width: 80%;
  justify-content: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.8);
  white-space: pre-line;
  margin: 12px;
`;

const CategoryList = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px;
  flex-wrap: wrap;
`;

const CategoryItem = styled.button`
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  background-color: rgba(0, 0, 0, 0);
  margin: 12px;
  font-size: 12px;
`;

const CategoryCurrentItem = styled.button`
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 12px;
  font-size: 12px;
`;

const ButtonList = styled.div`
  width: 100%;
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

const Faq = () => {
  const [currentCategory, setCurrentCategory] = useRecoilState(CurrentFaqCategory);
  const [faqs, setFaqs] = useRecoilState(FaqsState);
  const [faqCategories, setFaqCategories] = useRecoilState(FaqCategoriesState);

  const onClickChangeCurrentCategoryButton = (category) => {
    if (currentCategory === category) {
      setCurrentCategory('');
      return;
    }
    setCurrentCategory(category);
  };

  useEffect(async () => {
    try {
      const categoryResponse = await FaqApi.getFaqCategories();
      setFaqCategories(categoryResponse.data.data.map((data) => FaqCategoryResponse(data)));

      const faqResponse = await FaqApi.getFaqs();
      setFaqs(faqResponse.data.data.map((data) => FaqResponse(data)));
    } catch (error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
  }, []);

  return (
    <Wrapper>
      <h2>FAQ 관리</h2>
      <CategoryList>
        {faqCategories.map((category) => {
          if (category.category === currentCategory) {
            return (
              <CategoryCurrentItem
                key={category.category}
                onClick={() => onClickChangeCurrentCategoryButton(category.category)}
              >
                {category.description}
              </CategoryCurrentItem>
            );
          }
          return (
            <CategoryItem key={category.category} onClick={() => onClickChangeCurrentCategoryButton(category.category)}>
              {category.description}
            </CategoryItem>
          );
        })}
      </CategoryList>
      {faqs
        .filter((faq) => faq.category === currentCategory || currentCategory === '')
        .map((faq) => {
          return (
            <Item key={faq.faqId}>
              <ItemTitle>질문</ItemTitle>
              <ItemContent>{faq.question}</ItemContent>
              <ItemTitle>답변</ItemTitle>
              <ItemContent>{faq.answer}</ItemContent>
              <ItemTitle>카테고리</ItemTitle>
              <ItemContent>
                {faqCategories.find((category) => category.category === faq.category).description}
              </ItemContent>
              <ItemTitle>생성일자</ItemTitle>
              <ItemContent>{faq.createdAt}</ItemContent>
              <ItemTitle>최근 수정일자</ItemTitle>
              <ItemContent>{faq.updatedAt}</ItemContent>
              <ButtonList>
                <Button>수정하기</Button>
                <Button>삭제하기</Button>
              </ButtonList>
            </Item>
          );
        })}
    </Wrapper>
  );
};

export default Faq;
