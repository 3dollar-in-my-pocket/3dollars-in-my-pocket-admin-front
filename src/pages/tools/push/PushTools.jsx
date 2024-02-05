import { Box, Button, Container, Input, TextField, } from '@material-ui/core';
import { DataGrid, GridColDef, GridValueGetterParams } from '@material-ui/data-grid';
import React, { useEffect, useRef, useState } from 'react';
import { CommonApi, UserApi } from 'apis';

const columns: GridColDef[] = [
    {
        field: 'userId',
        headerName: 'UserId',
        width: 150,
        editable: false,
    },
    {
        field: 'name',
        headerName: 'name',
        width: 150,
        editable: false,
    },
];

const PushTools = () => {
    const [name, setName] = useState('');
    const [userIds, setUserIds] = useState([]);
    const [searchUsers, setSearchUsers] = useState([])
    const [selectUserIds, setSelectUserIds] = useState([])
    const [targetUserIds, setTargetUserIds] = useState([])

    useEffect(async () => {

    }, [])

    const handleOnSearchButton = async () => {
        const { data } = await UserApi.listUsers(name, userIds)
        setSearchUsers(data.data.contents)
    }

    const handleAddTargetUserButton = () => {
        if (selectUserIds.length === 0) {
            alert("선택")
            return
        }
        setTargetUserIds([...new Set([...targetUserIds, ...selectUserIds])])
    }

    const onChangeName = (event) => {
        setName(event.target.value)
    }

    return (
        <Container maxWidth="lg">
            <h2>푸시 관리 툴</h2>
            <TextField id="name" label="닉네임" variant="standard" value={name} onChange={onChangeName} />
            <TextField id="userId" label="UserId" />
            <Button variant="contained" onClick={handleOnSearchButton}>유저 검색하기</Button>
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={searchUsers.map((user) => { return { id: user.userId, ...user } })}
                    columns={columns}
                    pageSizeOptions={[5]}
                    checkboxSelection
                    onSelectionModelChange={(userIds) => {
                        setSelectUserIds(userIds)
                    }}
                />
            </Box>
            <Button variant="contained" onClick={handleAddTargetUserButton}>대상자 추가하기</Button>

            <h2>대상자 목록</h2>
            {targetUserIds.length === 0 ? '아직 대상자가 없어요' : targetUserIds.map((user, index, array) => (
                <React.Fragment key={user}>
                    {user}{index < array.length - 1 && ', '}
                </React.Fragment>
            ))}

            <div />
            <TextField id="title" label="푸시 제목" variant="standard" multiline />
            <div />
            <TextField id="content" label="푸시 내용" variant="standard" multiline />
            <div />
            <Button variant="contained">푸시 발송하기</Button>
        </Container>
    )
}

export default PushTools;