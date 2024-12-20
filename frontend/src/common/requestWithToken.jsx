import axios from 'axios';
import {logout} from "../reducers/reducer/userSlice";
import {clearFriends} from "../reducers/reducer/friendSlice";
import {disconnectWebsocket} from "./webSocketService";

export function sendRequestWithToken(apiEndpoint, requestData, method, dispatch) {
    let accessToken = localStorage.getItem('token');

    // axios options 설정
    let axiosOptions = {
        method: method,
        url: process.env.REACT_APP_SERVER_URL + apiEndpoint,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    };

    if (method === 'POST') {
        axiosOptions.data = requestData;
    }

    return axios(axiosOptions)
        .then(async response => {
            //성공 응답이 오면 그대로 반환
            return { status: response.status, data: response.data };
        })
        .catch(async error => {
            console.log(error.response.data);
            if (error.response.data && error.response.status === 401) {
                const errorMessage = error.response.data.message;
                console.log(errorMessage);

                // 새로운 토큰을 발급받았을 경우에 다시 로컬 스토리지에 토큰 저장후 재요청
                if(errorMessage==='NEW_ACCESS_TOKEN') {
                    const newToken = error.response.data.token;
                    //새로운 액세스 토큰으로 교체
                    window.localStorage.setItem('token', newToken);
                    //Authorization 헤더에 새로운 액세스 토큰 추가
                    axiosOptions.headers['Authorization'] = `Bearer ${newToken}`;

                    console.log("새로운 액세스 토큰으로 재요청");
                    return axios(axiosOptions)
                        .then(res => ({ status: res.status, data: res.data }))
                        .catch(error => {throw new Error('Refresh token expired')});
                }
                // 리프레시 토큰도 만료되었을 경우 로그아웃
                else {
                    console.log("리프레시 토큰도 만료, 로그아웃처리");
                    disconnectWebsocket(dispatch);
                    window.localStorage.removeItem('token');
                    await dispatch(logout()); // 로그아웃 액션 디스패치
                    await dispatch(clearFriends()); // 친구 목록 초기화
                }
            } else {
                throw error;
            }
        });
}