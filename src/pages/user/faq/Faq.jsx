import { FaqResponse } from 'apis/dto/response';
import { FaqCategoryResponse } from 'apis/dto/response/FaqResponse';
import FaqApi from 'apis/FaqApi';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { FaqsState } from 'stores';
import { CurrentFaqCategory, FaqCategoriesState } from 'stores/FaqState';
import styled from 'styled-components';

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
  margin: 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 32px;
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
  font-size: 16px;
  color: rgba(0, 0, 0, 0.8);
  white-space: pre;
  margin: 12px;
`;

const CategoryList = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px;
`;

const CategoryItem = styled.button`
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  background-color: rgba(0, 0, 0, 0);
  margin: 12px;
`;

const CategoryCurrentItem = styled.button`
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 12px;
`;

const ButtonList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px;
  font-size: 16px;
  padding: 8px;
`;

const Faq = () => {
  const [currentCategory, setCurrentCategory] = useRecoilState(CurrentFaqCategory);
  const [faqs, setFaqs] = useRecoilState(FaqsState);
  const [faqCategories, setFaqCategories] = useRecoilState(FaqCategoriesState);

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

  const onClickCategoryBtn = (category) => {
    if (currentCategory === category) {
      setCurrentCategory('');
      return;
    }
    setCurrentCategory(category);
  };

  return (
    <Wrapper>
      <CategoryList>
        {faqCategories.map((category) => {
          if (category.category === currentCategory) {
            return (
              <CategoryCurrentItem onClick={() => onClickCategoryBtn(category.category)}>
                {category.description}
              </CategoryCurrentItem>
            );
          }
          return (
            <CategoryItem onClick={() => onClickCategoryBtn(category.category)}>{category.description}</CategoryItem>
          );
        })}
      </CategoryList>
      {faqs
        .filter((faq) => faq.category === currentCategory || currentCategory === '')
        .map((faq) => {
          return (
            <Item>
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
