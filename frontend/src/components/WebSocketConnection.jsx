import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {connectWebsocket, disconnectWebsocket} from "../common/webSocketService";

const WebSocketConnection = () => {
    const dispatch = useDispatch();
    const { isLoggedIn, userInfo } = useSelector(state => state.user);
    const chatRooms = useSelector(state => state.chatRoom.chatRoom);

    useEffect(() => {
        if (isLoggedIn){
            connectWebsocket(process.env.REACT_APP_SERVER_URL + "/ws", dispatch, userInfo.id, userInfo.email, chatRooms);
            console.log("웹소켓 연결");
        } else {
            disconnectWebsocket();
            window.localStorage.removeItem('token');
            console.log("웹소켓 연결 해제");
        }

    }, [isLoggedIn]);

    return null;
};

export default WebSocketConnection;
