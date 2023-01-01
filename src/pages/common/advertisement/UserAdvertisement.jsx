import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { AdvertisementApi } from 'apis';
import { AdvertisementsWithPageResponse } from 'apis/dto/response';
import { DateUtils } from 'utils';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const UserAdvertisement = () => {
  const classes = useStyles();

  const [advertisement, setAdvertisements] = useState([]);
  const [positionTypes, setPositionTypes] = useState(new Map());

  useEffect(async () => {
    try {
      const positionTypes = await AdvertisementApi.getAdvertisementPositionTypes();
      const positionsMap = new Map();
      positionTypes.map((position) => positionsMap.set(position.key, position.description));
      setPositionTypes(positionsMap);

      const advertisementResponse = await AdvertisementApi.getAdvertisements(1, 30, 'USER_API');
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

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">-</TableCell>
            <TableCell align="left">광고 위치</TableCell>
            <TableCell align="left">제목</TableCell>
            <TableCell align="left">서브 제목</TableCell>
            <TableCell align="left">링크</TableCell>
            <TableCell align="left">링크</TableCell>
            <TableCell align="left">광고 시작 시간</TableCell>
            <TableCell align="left">광고 종료 시간</TableCell>
            <TableCell align="left">광고 정렬 방식</TableCell>
            <TableCell align="left">광고 순서 (PINNED)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {advertisement.map((row) => (
            <TableRow key={row.advertisementId}>
              <TableCell align="left">{row.advertisementId}</TableCell>
              <TableCell align="left">{positionTypes.get(row.positionType)}</TableCell>
              <TableCell align="left">{row.title}</TableCell>
              <TableCell align="left">{row.subTitle}</TableCell>
              <TableCell align="left">
                <img src={row.imageUrl} width="100" />
              </TableCell>
              <TableCell align="left">{row.linkUrl}</TableCell>
              <TableCell align="left">{row.startDateTime}</TableCell>
              <TableCell align="left">{row.endDateTime}</TableCell>
              <TableCell align="left">{row.orderType}</TableCell>
              <TableCell align="left">{row.sortNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserAdvertisement;
