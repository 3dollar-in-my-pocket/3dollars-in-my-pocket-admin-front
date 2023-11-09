import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { SwipeableDrawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Mail as MailIcon, Inbox as InboxIcon } from '@material-ui/icons';

const Navigation = styled.div`
  display: 'flex';
  height: 75px;
  background: #dedede;
  width: 100vw;
`;

const Title = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: 'white';
  font-weight: 'bold';
  height: 100%;
  font-size: 24px;
  color: #000000;
  margin: 0px;
`;

const linkList = [
  { link: '/', name: '홈' },
  { link: '/boss/registration', name: '사장님 서비스 - 가입 신청 관리' },
  { link: '/upload', name: '[운영툴] 이미지 업로드하기' },
  { link: '/tools/cache', name: '[운영툴] 캐시 관리' },
  { link: '/user/advertisement', name: '유저 서비스 - 광고 관리' },
  { link: '/admin/mypage', name: '마이페이지' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const history = useHistory();

  const list = () => (
    <div className="left" role="presentation" onClick={() => setOpen(false)} onKeyDown={() => setOpen(false)}>
      <List>
        {linkList.map((link, index) => (
          <ListItem button key={link.link} onClick={() => history.push(link.link)}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={link.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div>
      <Navigation onClick={() => setOpen(true)}>
        <Title>메뉴 보기</Title>
      </Navigation>
      <SwipeableDrawer anchor="left" open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
        {list()}
      </SwipeableDrawer>
    </div>
  );
}
