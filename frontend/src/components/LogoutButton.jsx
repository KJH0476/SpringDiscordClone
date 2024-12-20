import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../reducers/reducer/userSlice';
import { clearFriends } from '../reducers/reducer/friendSlice';
import {clearChatRoom} from "../reducers/reducer/chatRoomSlice";
import {SignOut} from "@phosphor-icons/react";
import {persistor} from "../index";
import {disconnectWebsocket} from "../common/webSocketService";
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await disconnectWebsocket(); // 웹소켓 연결 해제
        window.localStorage.removeItem('token');
        await dispatch(logout()); // 로그아웃 액션 디스패치
        await dispatch(clearFriends()); // 친구 목록 초기화
        await dispatch(clearChatRoom()); // 친구 목록 초기화
    };

    const purge = async () => {
        await persistor.purge();
    };

    return (
        <SignOut size={22} weight="bold" onClick={async () => {
            await handleLogout();
            await purge();
            navigate('/');
        }} />
    );
};

export default LogoutButton;