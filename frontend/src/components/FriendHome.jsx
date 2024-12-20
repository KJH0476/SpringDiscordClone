import FriendBar from "./FriendBar";
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import {useState} from "react";
import * as colors from "@mui/material/colors";
import { useSelector, useDispatch } from "react-redux";
import {ChatCircle, DotsThreeCircleVertical, CheckCircle, XCircle} from '@phosphor-icons/react';
import {sendRequestWithToken} from "../common/requestWithToken";
import {updateFriendRelation, removeFriends} from "../reducers/reducer/friendSlice";
import {addChatRoom} from "../reducers/reducer/chatRoomSlice";
import {stompClient} from "../common/webSocketService";

const FriendHome = () => {
    const member = useSelector(state => state.user.userInfo);
    const friends = useSelector(state => state.friend.friends);
    const filter = useSelector(state => state.friend.filter);
    const dispatch = useDispatch();

    const filteredFriends = friends.filter(friend => {
        switch(filter) {
            case 'ONLINE_FRIENDS':
                return friend.friendStatus === 'ONLINE' && friend.relation === 'FRIENDS';
            case 'ALL_FRIENDS':
                return friend.relation === 'FRIENDS';
            case 'PENDING_FRIENDS':
                return friend.relation === 'RECEIVED';
            default:
                return true; // 기본적으로 모든 친구를 표시
        }
    });

    const friendCount = filteredFriends.length;
    console.log(friends);

    const acceptFriend = async (friendName, friendMemberId) => {
        try{
            const data = await sendRequestWithToken('/received-friend', {
                memberName: member.username,
                friendName: friendName
            }, 'POST', dispatch).then(() => dispatch(updateFriendRelation({
                friendName: friendName,
                relation: 'FRIENDS',
            })));
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }

    const refuseFriend = async (friendName) => {
        try{
            const data = await sendRequestWithToken('/delete-friend', {
                memberName: member.username,
                friendName: friendName
            }, 'POST', dispatch).then(() => dispatch(removeFriends(friendName)));
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }

    //채팅방 생성
    const createChatRoom = async (member, friend) => {
        const randomRoomId = `room_${Date.now()}`;
        const chatRoom = {
            firstParticipantId: member.id,
            secondParticipantId: friend.friendMemberId,
            roomId: randomRoomId,
            roomName: friend.friendName
        };

        const receiveChatRoom = {
            email: friend.friendEmail, // 친구의 이메일
            name: friend.friendName, // 친구의 이름
            friendEmail: member.email, // 로그인한 사용자의 이메일
            friendName: member.username, // 로그인한 사용자의 이름
            roomId: randomRoomId // 임의의 고유 방 아이디 생성
        };

        try{
            const data = await sendRequestWithToken('/add-chatRoom', chatRoom
                , 'POST', dispatch).then(() => dispatch(addChatRoom(data)));
            console.log(data);
            stompClient.send('/pub/chat', {}, JSON.stringify(receiveChatRoom));
        } catch (e) {
            console.log(e);
        }

    };

    return (
        <>
            <FriendBar />
            <Divider />
            <SearchBoxToFriend />
            <FriendCount count={friendCount} />
            <Divider sx={{ mx: 3, width: '60%' }} />
        <div className="ml-4 relative flex w-3/5 flex-col dark:bg-gray-700">
            <List sx={{width: '100%'}}>
                {filteredFriends.map((friend) => (
                    <ListItem
                        key={friend.id}
                        alignItems="center"
                        className="mx-1.5 text-base cursor-pointer items-center rounded px-4 py-1 text-gray-700 dark:text-gray-100 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600">
                        <ListItemAvatar>
                            <Avatar
                                alt={friend.friendName}
                                src="/static/images/avatar/1.jpg"
                                sx={{width: 34, height: 34, bgcolor: colors.orange[500], border: '2px solid black'}}/>
                            <div
                                className="relative left-1/2 top-1/2 h-3 w-3 justify-center
                                -translate-x-1/2 -translate-y-1/2 rounded-full text-center border-2 border-solid border-black"
                                style={{backgroundColor: friend.friendStatus === 'ONLINE' ? 'green' : 'gray'}}
                            ></div>
                        </ListItemAvatar>
                        <ListItemText
                            primary={friend.friendName}/>
                        {friend.relation === 'RECEIVED' ? (
                            <>
                                <CheckCircle onClick={() => acceptFriend(friend.friendName, friend.friendMemberId)} size={32} color="#669c35" weight="fill" />
                                <XCircle onClick={() => refuseFriend(friend.friendName)} size={32} color="#e32400" weight="fill" />
                            </>
                        ) : (
                            <>
                                <ChatCircle onClick={() => createChatRoom(member, friend)} size={28} weight="fill" className="mx-2" />
                                <DotsThreeCircleVertical size={28} weight="fill" />
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
        </div>
        </>
    );
}

//검색 필드
const SearchBoxToFriend = () => {
    const [inputValue, setInputValue] = useState('');

    // 입력 필드의 값이 바뀔 때 호출되는 함수입니다.
    const handleInputChange = (e) => {
        // 입력된 값을 상태로 설정합니다.
        setInputValue(e.target.value);
    };

    return (
        <div
            className="ml-4 my-3 w-full cursor-pointer py-3 px-4">
            <div className="flex h-6 items-center">
                <input type="text" id="helper-text" aria-describedby="helper-text-explanation"
                       className="bg-gray-100 border border-gray-300 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block
                       w-3/5 p-2.5  dark:bg-black dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="검색하기"
                       value={inputValue}
                       onChange={handleInputChange}
                       />
                <SearchIcon className="mx-2 ursor-pointer items-center rounded dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600" />
            </div>
        </div>
    );
}

//리스트 개수 카운트
const FriendCount = ({ count }) => {
    const filter = useSelector(state => state.friend.filter); // 현재 필터 상태를 가져옵니다.

    //필터링 상태에 따라 텍스트 변경
    let text;
    switch(filter) {
        case 'ONLINE_FRIENDS':
            text = '온라인';
            break;
        case 'ALL_FRIENDS':
            text = '모든 친구';
            break;
        case 'PENDING_FRIENDS':
            text = '대기 중인 요청';
            break;
        default:
            text = '친구';
    }

    return (
        <div className="mx-9 my-2 text-sm text-gray-600 dark:text-gray-300 font-semibold">
            {text} - {count}명
        </div>
    );
}

export default FriendHome;