import { Gif, Gift, PlusCircle, Smiley, Sticker } from "@phosphor-icons/react";
import {sendRequestWithToken} from "../common/requestWithToken";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useRef, useState} from "react";
import {stompClient} from "../common/webSocketService";
import Avatar from "@mui/material/Avatar";
import * as colors from "@mui/material/colors";
import {resetUnreadCount} from "../reducers/reducer/unreadMessagesSlice";

const dateFormatter = new Intl.DateTimeFormat("en", {
    timeStyle: "medium",
    dateStyle: "short",
});

const ChannelChat = ({ roomId }) => {
    const chatRooms = useSelector(state => state.chatRoom.chatRoom);
    const member = useSelector(state => state.user.userInfo);
    const dispatch = useDispatch();
    const [posts, setPosts] = useState([]);

    const chatRoom = chatRooms.find(room => room.chatRoomInfo && room.chatRoomInfo.roomId === roomId);
    const chatRoomParticipants = chatRoom.memberList;
    const channelName = formatChatRoomParticipants(chatRoomParticipants);

    useEffect(() => {
        getChatContent(roomId, setPosts, dispatch);
    }, [roomId]);

    useEffect(() => {
        if (stompClient && member.email && roomId) {
            console.log('Subscribing to chat messages');
            const subscription = stompClient.subscribe(`/topic/messages/${roomId}`, message => {
                const messageBody = JSON.parse(message.body);
                console.log('Received message:', messageBody);
                setPosts(prevPosts => [...prevPosts, {
                    id: messageBody.id,
                    username: messageBody.senderName,
                    usernameColour: "text-indigo-300",
                    date: messageBody.timestamp,
                    avatar: `https://api.dicebear.com/7.x/micah/svg?seed=${messageBody.senderName}&radius=50`,
                    message: messageBody.content
                }]);
                dispatch(resetUnreadCount(roomId));
            });
            dispatch(resetUnreadCount(roomId));
            return () => subscription.unsubscribe();
        }
    }, [stompClient, member.email, roomId]);


    return (
        <div className="flex flex-col w-full bg-white-700 dark:bg-gray-700" style={{ height: 'calc(100vh - 3rem)' }}>
            <Divider />
            <div className="flex-grow overflow-y-auto">
                <Posts posts={posts} memberList={chatRoom.memberList} chatRoomInfo={chatRoom} chnnelName={channelName} />
            </div>
            <MessageInput member={member} chatRoom={chatRoom} setPosts={setPosts} posts={posts} className="mt-auto" />
        </div>
    );
};

const getChatContent = async (roomId, setPosts, dispatch) => {
    try {
        const chatMessage = await sendRequestWithToken('/messages/' + roomId, null, 'GET', dispatch);
        setPosts(chatMessage.data.map(msg => ({
            id: msg.id,
            username: msg.senderName,
            usernameColour: "text-indigo-300",
            date: msg.timestamp,
            avatar: `https://api.dicebear.com/7.x/micah/svg?seed=${msg.senderName}&radius=50`,
            message: msg.content
        })));
    } catch (e) {
        console.log(e);
    }
};

const Divider = () => (
    <hr
        className="m-0 w-full border
                border-gray-400 bg-gray-400 p-0
                dark:border-gray-800 dark:bg-gray-800"
    />
);

const Posts = ({ posts, memberList, chatRoomInfo, chnnelName }) => {
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [posts]);

    const userPosts = posts.map((post, index) => (
        <Post post={post} key={post.id} ref={index === posts.length - 1 ? endOfMessagesRef : null} />
    ));

    return (
        <>
            <Avatar
                className="h-16 w-16 rounded-full"
                alt={chatRoomInfo.chatRoomInfo.roomName} src="/static/images/avatar/1.jpg"
                sx={{
                    width: 80,
                    height: 80,
                    marginX: 3,
                    marginTop: 3,
                    marginBottom: 2,
                    bgcolor: colors.orange[500],
                    border: '2px solid white'
                }}
            />
            <div className="mx-5 my-3 font-bold text-4xl dark:text-white">{chnnelName}</div>
            <div className="mx-5 my-3 font-semibold text-2xl dark:text-gray-400">
                {memberList.map(member => member.name).join(', ')}
            </div>
            <Divider/>
            <div className="flex flex-col overflow-y-auto">
                {userPosts}
            </div>
        </>
    );
};

const Post = React.forwardRef(({post}, ref) => {
    const date = new Date(post.date);
    const formattedDate = dateFormatter.format(date).replace(",", "");

    return (
        <div ref={ref} className="mt-4 flex">
            <img
                className="mx-4 h-10 rounded-full bg-transparent"
                src={post.avatar}
                alt="User avatar"
            />
            <div className="flex flex-col items-start justify-start">
                <div className="mb-1 flex justify-start leading-none">
                    <h6 className={`font-medium leading-none ${post.usernameColour}`}>
                        {post.username}
                    </h6>
                    <p className="ml-2 self-end text-xs font-medium leading-tight dark:text-gray-500 text-gray-600">
                        {formattedDate}
                    </p>
                </div>
                <div className="dark:text-gray-400 text-gray-900">{post.message}</div>
            </div>
        </div>
    );
});

const MessageInput = ({ member, chatRoom, setPosts, posts }) => {
    const [message, setMessage] = useState('');
    const [isComposing, setIsComposing] = useState(false);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleComposition = (e) => {
        setIsComposing(e.type !== 'compositionend');
    };

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && !isComposing && message.trim()) {
            e.preventDefault();
            const chatMessage = {
                roomId: chatRoom.chatRoomInfo.roomId,
                senderEmail: member.email,
                senderName: member.username,
                content: message,
                timestamp: new Date().toISOString()
            };
            await sendMessage(chatMessage, chatRoom.chatRoomInfo.roomId, setPosts, posts);
            setTimeout(() => setMessage(''), 0);
        }
    };

    return (
        <div className="mx-4 my-6 flex items-center rounded-lg bg-gray-300 py-2 dark:bg-gray-600">
            <div>
                <PlusCircle
                    className="mx-4 cursor-pointer text-gray-600
                  hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    weight="fill"
                    size={26}
                />
            </div>

            <input
                className="w-full bg-inherit text-gray-900 outline-none
                 placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
                type="text"
                placeholder={`메세지를 입력해주세요.`}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onCompositionStart={handleComposition}
                onCompositionEnd={handleComposition}
            />

            <div className="mr-1 flex">
                <Gift
                    className="mx-1.5 cursor-pointer text-gray-600
                  hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    weight="fill"
                    size={28}
                />
                <Gif
                    className="mx-1.5 cursor-pointer text-gray-600
                  hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    weight="fill"
                    size={28}
                />
                <Sticker
                    className="mx-1.5 cursor-pointer text-gray-600
                  hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    weight="fill"
                    size={28}
                />
                <Smiley
                    className="mx-1.5 cursor-pointer text-gray-600
                  hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    weight="fill"
                    size={28}
                />
            </div>
        </div>
    );
};

const sendMessage = async (message, roomId, setPosts, posts) => {
    await stompClient.send("/app/chat/"+roomId, {}, JSON.stringify(message));
    const msg = {
        username: message.senderName,
        usernameColour: "text-indigo-300",
        date: message.timestamp,
        avatar: `https://api.dicebear.com/7.x/micah/svg?seed=${message.senderName}&radius=50`,
        message: message.content
    }
};

function formatChatRoomParticipants(memberList) {
    if (!memberList.length) {
        return '참가자 없음';
    }
    const firstMember = memberList[0].name;
    const additionalCount = memberList.length - 1;

    if (additionalCount > 0) {
        return `${firstMember} 외 ${additionalCount}명`;
    } else {
        return firstMember;
    }
}

export default ChannelChat;
