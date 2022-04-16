import AdvertisementApi from 'apis/AdvertisementApi';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { AdvertisementsState, CurrentAdvertisementCategory } from 'stores';
import styled from 'styled-components';
import { AdvertisementsWithPageResponse } from 'apis/dto/response';

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

const LinkContent = styled.a`
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

const ItemImageLayer = styled.div`
  display: flex;
  text-align: center;
  justify-content: center;
  margin: 12px;
`;

const ItemImage = styled.img`
  width: 240px;
`;

const advertisementCategories = [
  {
    category: 'SPLASH',
    description: '스플래시 광고',
  },
  {
    category: 'MAIN_PAGE_CARD',
    description: '메인 카드 광고',
  },
  {
    category: 'STORE_CATEGORY_LIST',
    description: '가게 카테고리 광고',
  },
  {
    category: 'MENU_CATEGORY_BANNER',
    description: '메뉴 카테고리 광고',
  },
];

const Advertisement = () => {
  const [size] = useState(30);
  const [page] = useState(1);
  const [currentCategory, setCurrentCategory] = useRecoilState(CurrentAdvertisementCategory);
  const [advertisements, setAdvertisements] = useRecoilState(AdvertisementsState);

  useEffect(async () => {
    try {
      const advertisementResponse = await AdvertisementApi.getAdvertisements(page, size);
      const { contents } = AdvertisementsWithPageResponse(advertisementResponse.data.data);
      setAdvertisements(contents);
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
      <h2>광고 관리</h2>
      <CategoryList>
        {advertisementCategories.map((category) => {
          if (category.category === currentCategory) {
            return (
              <CategoryCurrentItem key={category.category} onClick={() => onClickCategoryBtn(category.category)}>
                {category.description}
              </CategoryCurrentItem>
            );
          }
          return (
            <CategoryItem key={category.category} onClick={() => onClickCategoryBtn(category.category)}>
              {category.description}
            </CategoryItem>
          );
        })}
      </CategoryList>
      {advertisements
        .filter((advertisement) => advertisement.positionType === currentCategory || currentCategory === '')
        .map((advertisement) => {
          return (
            <Item key={advertisement.advertisementId}>
              <ItemImageLayer>
                <ItemImage src={advertisement.imageUrl} />
              </ItemImageLayer>
              <ItemTitle>제목</ItemTitle>
              <ItemContent>{advertisement.title}</ItemContent>
              <ItemTitle>부가 설명</ItemTitle>
              <ItemContent>{advertisement.subTitle}</ItemContent>
              <ItemTitle>플랫폼</ItemTitle>
              <ItemContent>{advertisement.platformType}</ItemContent>
              <ItemTitle>링크 URL</ItemTitle>
              <LinkContent href={advertisement.linkUrl}>링크 이동</LinkContent>
              <ItemTitle>배경 색상</ItemTitle>
              <ItemContent>{advertisement.bgColor}</ItemContent>
              <ItemTitle>폰트 색상</ItemTitle>
              <ItemContent>{advertisement.fontColor}</ItemContent>
              <ItemTitle>광고 시작 날짜</ItemTitle>
              <ItemContent>{advertisement.startDateTime}</ItemContent>
              <ItemTitle>광고 종료 날짜</ItemTitle>
              <ItemContent>{advertisement.endDateTime}</ItemContent>
              <ItemTitle>생성일자</ItemTitle>
              <ItemContent>{advertisement.createdAt}</ItemContent>
              <ItemTitle>최근 수정일자</ItemTitle>
              <ItemContent>{advertisement.updatedAt}</ItemContent>
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

export default Advertisement;
