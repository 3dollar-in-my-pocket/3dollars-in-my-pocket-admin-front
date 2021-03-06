import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { AdvertisementsState, CurrentAdvertisementCategory } from 'stores';
import { AdvertisementApi } from 'apis';
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
    description: '???????????? ??????',
  },
  {
    category: 'MAIN_PAGE_CARD',
    description: '?????? ?????? ??????',
  },
  {
    category: 'STORE_CATEGORY_LIST',
    description: '?????? ???????????? ??????',
  },
  {
    category: 'MENU_CATEGORY_BANNER',
    description: '?????? ???????????? ??????',
  },
];

const UserAdvertisement = () => {
  const [size] = useState(30);
  const [page] = useState(1);
  const [currentCategory, setCurrentCategory] = useRecoilState(CurrentAdvertisementCategory);
  const [advertisements, setAdvertisements] = useRecoilState(AdvertisementsState);

  const onClickChangeCurrentCategoryButton = (category) => {
    if (currentCategory === category) {
      setCurrentCategory('');
      return;
    }
    setCurrentCategory(category);
  };

  useEffect(async () => {
    try {
      const advertisementResponse = await AdvertisementApi.getAdvertisements(page, size, 'USER_API');
      const { contents } = AdvertisementsWithPageResponse(advertisementResponse.data.data);
      setAdvertisements(contents);
    } catch (error) {
      if (!error.response) {
        alert('?????? ????????? ????????? ?????????????????????\n????????? ?????? ??????????????????');
      } else {
        alert(error.response.data.message);
      }
    }
  }, []);

  return (
    <Wrapper>
      <h2>?????? ??????</h2>
      <CategoryList>
        {advertisementCategories.map((category) => {
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
      {advertisements
        .filter((advertisement) => advertisement.positionType === currentCategory || currentCategory === '')
        .map((advertisement) => {
          return (
            <Item key={advertisement.advertisementId}>
              <ItemImageLayer>
                <ItemImage src={advertisement.imageUrl} />
              </ItemImageLayer>
              <ItemTitle>??????</ItemTitle>
              <ItemContent>{advertisement.title}</ItemContent>
              <ItemTitle>?????? ??????</ItemTitle>
              <ItemContent>{advertisement.subTitle}</ItemContent>
              <ItemTitle>?????????</ItemTitle>
              <ItemContent>{advertisement.platformType}</ItemContent>
              <ItemTitle>?????? URL</ItemTitle>
              <LinkContent href={advertisement.linkUrl}>?????? ??????</LinkContent>
              <ItemTitle>?????? ??????</ItemTitle>
              <ItemContent>{advertisement.bgColor}</ItemContent>
              <ItemTitle>?????? ??????</ItemTitle>
              <ItemContent>{advertisement.fontColor}</ItemContent>
              <ItemTitle>?????? ?????? ??????</ItemTitle>
              <ItemContent>{advertisement.startDateTime}</ItemContent>
              <ItemTitle>?????? ?????? ??????</ItemTitle>
              <ItemContent>{advertisement.endDateTime}</ItemContent>
              <ItemTitle>????????????</ItemTitle>
              <ItemContent>{advertisement.createdAt}</ItemContent>
              <ItemTitle>?????? ????????????</ItemTitle>
              <ItemContent>{advertisement.updatedAt}</ItemContent>
              <ButtonList>
                <Button>????????????</Button>
                <Button>????????????</Button>
              </ButtonList>
            </Item>
          );
        })}
    </Wrapper>
  );
};

export default UserAdvertisement;
