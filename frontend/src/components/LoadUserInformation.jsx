import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { decodeToken } from '../common/decodeToken';
import { loginSuccess, logout, setLoading } from '../reducers/reducer/userSlice';
import { addFriends } from '../reducers/reducer/friendSlice';
import { sendRequestWithToken } from "../common/requestWithToken";
import {addChatRoom} from "../reducers/reducer/chatRoomSlice";

export const LoadUserInformation = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(state => state.user.isLoggedIn)
    const [infoLoaded, setInfoLoaded] = useState(false);

    useEffect(() => {
        // 로그인 상태가 true이고, 정보가 아직 로드되지 않았을 때만 실행합니다.
        console.log("LoadUserInformation 실행됨");
        if (isLoggedIn && !infoLoaded) {
            const email = decodeToken();
            const loadData = async () => {
                try {
                    const { status, data } = await sendRequestWithToken(`/main/${email}`, null, 'GET', dispatch);
                    if (status === 200 && data) {
                        dispatch(loginSuccess(data));

                        // 사용자 정보 로드 성공 후 친구 정보 로드
                        await loadFriendsData(data.id);

                        await loadChatRoom(data.id);

                        // 정보 로드가 완료되었음을 표시합니다.
                        setInfoLoaded(true);
                        dispatch(setLoading(true));
                    } else {
                        throw new Error('No user info');
                    }
                } catch (error) {
                    console.error(error);
                    if (error.message === 'Refresh token expired') {
                        dispatch(logout());
                    } else {
                        console.log("An error occurred:", error.message);
                    }
                }
            };
            loadData();
        }
    }, [isLoggedIn, infoLoaded, dispatch]); // 의존성 배열에 infoLoaded 추가

    const loadFriendsData = async (memberId) => {
        try {
            const [friendsResponse, friendsReceiveResponse] = await Promise.all([
                sendRequestWithToken(`/find-all-friend/${memberId}/FRIENDS`, null, 'GET', dispatch),
                sendRequestWithToken(`/find-all-friend/${memberId}/RECEIVED`, null, 'GET', dispatch)
            ]);

            if (friendsResponse.status === 200 && friendsResponse.data) {
                dispatch(addFriends(friendsResponse.data));
            }

            if (friendsReceiveResponse.status === 200 && friendsReceiveResponse.data) {
                dispatch(addFriends(friendsReceiveResponse.data));
            }
            console.log("친구 정보 로드 완료");
        }
        catch (error) {
            console.error(error);
        }
    };

    const loadChatRoom = async (memberId) => {
        try {
            const { status, data } = await sendRequestWithToken(`/find-chatRoom/${memberId}`, null, 'GET', dispatch);
            if (status === 200 && data) {
                console.log("채팅방 정보 로드 완료");
                await dispatch(addChatRoom(data));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return null;
};
