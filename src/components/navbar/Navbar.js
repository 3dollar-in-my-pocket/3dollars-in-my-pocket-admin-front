import React, { useState } from 'react';
import styled from 'styled-components';
import {
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { Mail as MailIcon, Inbox as InboxIcon } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

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
  { link: '/ç', name: '홈' },
  { link: '/user/advertisement', name: '유저 - 광고 관리' },
  // { link: '/user/faq', name: '유저 - FAQ 관리' },
  { link: '/boss/registration', name: '사장님 - 가입 신청 관리' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const history = useHistory();

  const list = () => (
    <div
      className="left"
      role="presentation"
      onClick={() => setOpen(false)}
      onKeyDown={() => setOpen(false)}
    >
      <List>
        {linkList.map((link, index) => (
          <ListItem
            button
            key={link.link}
            onClick={() => history.push(link.link)}
          >
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
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
      <SwipeableDrawer
        anchor="left"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        {list()}
      </SwipeableDrawer>
    </div>
  );
}
