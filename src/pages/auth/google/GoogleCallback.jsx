import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import googleAuthApi from "../../../api/googleAuthApi";
import authApi from "../../../api/authApi";
import {LocalStorageService} from "../../../service/LocalStorageService";
import {useRecoilState} from "recoil";
import {LoginStatus} from "../../../state/LoginStatus";

const GoogleCallback = () => {
    const navigate = useNavigate();

    const [, setIsLoginState] = useRecoilState(LoginStatus);

    useEffect(() => {
        auth();

        async function auth() {
            if (!window.location.search) {
                return;
            }
            try {
                const params = new URLSearchParams(window.location.search);

                const accessToken = await googleAuthApi.getAccessToken({code: params.get('code')})

                const response = await authApi.login({accessToken: accessToken, socialType: 'GOOGLE'})
                if (!response.ok) {
                    setIsLoginState(false)
                    navigate('/');
                    return
                }
                LocalStorageService.set("AUTH_TOKEN", response.data.token);
                setIsLoginState(true)
                navigate('/manage');
            } catch (error) {
                setIsLoginState(false)
                navigate('/');
            }
        }
    }, []);
    return (<>
        <h1>Loading</h1>
    </>);
};

export default GoogleCallback;
