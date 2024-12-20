import { sendRequestWithToken } from "./requestWithToken";
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {updateUserStatus} from "../reducers/reducer/userSlice";
import {addFriends, updateFriendRelation, removeFriends, updateFriendStatus} from "../reducers/reducer/friendSlice";
import {addNotification} from "../reducers/reducer/notificationSlice";
import {peerConfig} from "./peerConfig";
import {addChatRoom} from "../reducers/reducer/chatRoomSlice";

let sockjs = null;
let memberId = null;
export let stompClient = null;
let userEmail = null;
let shouldReconnect = true;
let chatRooms = null;

//서버와의 웹소켓 연결을 설정, 연결이 끊어졌을 때 자동으로 재연결
export const connectWebsocket = (serverUrl, dispatch, userId, email, chatRoom) => {
    if (!sockjs) {
        sockjs = new SockJS(serverUrl);
        chatRooms = chatRoom;

        const onOpen = () => {
            console.log('Connection established');
            sendRequestWithToken(`/update-status/${userId}/ONLINE`, null, 'GET', dispatch)
                .then(() => {
                    console.log("User status updated to ONLINE");
                    dispatch(updateUserStatus('ONLINE'));
                });
            memberId = userId;
            initializeStompOverSockJS(dispatch, email);
        };

        const onMessage = (event) => {
            console.log('Message from server: ', event.data);
        };

        const onClose = () => {
            console.log('Connection closed, attempting to reconnect...');
            sockjs = null;
            if (shouldReconnect){
                console.log('Attempting to reconnect...');
                setTimeout(() => connectWebsocket(serverUrl, dispatch, userId, email), 5000); // 5초 후 재연결 시도
            }
        };

        const onError = (error) => {
            console.error('Connection error: ', error);
            sockjs = null;
            if (shouldReconnect) {
                console.log('Attempting to reconnect...');
                setTimeout(() => connectWebsocket(serverUrl, dispatch, userId, email), 5000);
            }
        };

        sockjs.onopen = onOpen;
        sockjs.onmessage = onMessage;
        sockjs.onclose = onClose;
        sockjs.onerror = onError;

        userEmail = email;
    }
};

//웹소켓 연결 해제
export const disconnectWebsocket = (dispatch) => {
    shouldReconnect = false;

    if (sockjs) {
        sockjs.close();
        sockjs = null;
        if (memberId) {
            sendRequestWithToken(`/update-status/${memberId}/OFFLINE`, null, 'GET', dispatch)
                .then(() => console.log("User status updated to OFFLINE"));
        }
    }
    if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
            console.log("STOMP client disconnected");
            stompClient = null;
        });
    }
};

//STOMP 클라이언트 초기화
const initializeStompOverSockJS = (dispatch, email) => {
    if (!stompClient || (stompClient && !stompClient.connected)) {
        //Stomp.over에 SockJS 인스턴스를 직접 전달하는 대신, SockJS 인스턴스를 반환하는 팩토리 함수를 전달
        stompClient = Stomp.over(() => new SockJS(process.env.REACT_APP_SERVER_URL + '/ws'));

        stompClient.connect({}, frame => {
            console.log('Connected via STOMP:', frame);
            setupNotificationsSubscription(dispatch);
            chatRooms?.map(cr => {
                const roomId = cr.chatRoomInfo.roomId;
                peerConfig(roomId, email, dispatch);
                console.log("peerConfig 실행");
            })
        }, error => {
            console.error('STOMP connection error:', error);
            stompClient = null;
        });
    }
};

//STOMP 메세지 구독
export const setupNotificationsSubscription = (dispatch) => {
    if (stompClient && stompClient.connected) {
        stompClient.subscribe(`/user/${userEmail}/queue/Notification`, message => {
            const notification = JSON.parse(message.body);
            console.log('Received notification:', notification);
            dispatch(addNotification(notification.message));

            if(notification.type==='REQUESTED') {
                sendRequestWithToken(`/find-all-friend/${memberId}/RECEIVED`, null, 'GET', dispatch)
                    .then(response => {
                        dispatch(addFriends(response.data));
                    });
            } else if(notification.type==='ACCEPTED') {
                console.log("Friend request accepted:", notification.name);
                dispatch(updateFriendRelation({
                    friendName: notification.name,
                    relation: 'FRIENDS',
                }));
            } else if(notification.type==='REFUSED') {
                dispatch(removeFriends(notification.name));
            }
        });
        stompClient.subscribe(`/user/${userEmail}/queue/reloadFriendList`, message => {
            const cleanMessage = message.body.replace(/"/g, '');
            console.log('Friend list reload requested:', cleanMessage);
            const [friendMemberId, friendStatus] = cleanMessage.split('_');

            console.log('Friend status update:', friendMemberId, friendStatus);

            //상태 업데이트 액션 디스패치
            dispatch(updateFriendStatus({
                friendMemberId: friendMemberId,
                friendStatus: friendStatus
            }));
        });
        stompClient.subscribe(`/user/${userEmail}/newChatRoom`, data => {
            dispatch(addChatRoom(JSON.parse(data.body)));
        });
    } else {
        console.error('STOMP client is not connected. Cannot setup subscription.');
    }
};