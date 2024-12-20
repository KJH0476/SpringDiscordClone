import {
  Hash,
  MagnifyingGlass,
  PushPin,
  Question,
  Tray,
  Users,
  Sun,
  Moon,
  PhoneCall,
  VideoCamera,
  UserPlus,
  PlusCircle
} from "@phosphor-icons/react";
import useDarkMode from "../hooks/useDarkMode";
import React, {memo, useEffect, useState} from 'react';
import Modal from 'react-modal';
import NotificationList from './NotificationList';
import '../index.css';
import ChannelChat from "./ChannelChat";
import {useNavigate, useParams} from "react-router-dom";
import VoiceCall from "./VoiceCall";
import VideoCall from "./VideoCall";
import {stompClient} from "../common/webSocketService";
import {useDispatch, useSelector} from "react-redux";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import * as colors from "@mui/material/colors";
import ListItemText from "@mui/material/ListItemText";
import {sendRequestWithToken} from "../common/requestWithToken";
import {addChatRoom, addMemberToRoom, updateRoomName} from "../reducers/reducer/chatRoomSlice";

const customStyles = {
  content: {
    position: 'absolute', // 모달을 절대적 위치로 설정
    top: '53px', // 모달 트리거 요소 아래에 위치
    left: '87%', // 화면의 가운데로부터 왼쪽으로 어느 정도 떨어진 위치에 모달이 나타나도록 조정
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, 0)', // X축으로만 이동
    width: '20rem', // 모달의 너비
    zIndex: 1000, // 모달의 z-index를 충분히 높게 설정
    borderRadius: '10px',
  },
  overlay: {
    position: 'fixed', // 오버레이를 화면에 고정
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent' // 배경색 투명으로 설정
  },
};

const friendAddModalCustomStyles = {
  content: {
    position: 'absolute', // 모달을 절대적 위치로 설정
    top: '53px', // 모달 트리거 요소 아래에 위치
    left: '70%', // 화면의 가운데로부터 왼쪽으로 어느 정도 떨어진 위치에 모달이 나타나도록 조정
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, 0)', // X축으로만 이동
    width: '20rem', // 모달의 너비
    zIndex: 1000, // 모달의 z-index를 충분히 높게 설정
    borderRadius: '10px',
  },
  overlay: {
    position: 'fixed', // 오버레이를 화면에 고정
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent' // 배경색 투명으로 설정
  },
};

Modal.setAppElement('#root');

const ChannelBar = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [friendAddModalIsOpen, setFriendAddModalIsOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("channelChat");
  const { roomId, role } = useParams();
  const chatRooms = useSelector(state => state.chatRoom.chatRoom);
  const friends = useSelector(state => state.friend.friends);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chatRoom = chatRooms.find(room => room.chatRoomInfo && room.chatRoomInfo.roomId === roomId);
  const chatRoomParticipants = chatRoom.memberList;
  const channelName = formatChatRoomParticipants(chatRoomParticipants);

  //일단 임시
  const email = chatRoomParticipants[0].email;

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  function openFriendAddModal() {
    setFriendAddModalIsOpen(true);
  }

  function closeFriendAddModal() {
    setFriendAddModalIsOpen(false);
  }

  useEffect(() => {
    // 조건에 따라 activeComponent 초기값 설정
    // 여기서는 수신자의 경우 role 파라미터가 'receiver'일 때 videoCall로 설정
    if(role === 'receiver') {
      setActiveComponent("videoCall");
    } else {
      setActiveComponent("channelChat");
    }
  }, [channelName, role]);

  //음성통화
  const handleVoiceCallClick = () => {
    setActiveComponent("voiceCall");
    console.log("Active component set to voiceCall");
  };

  //영상통화
  const handleVideoCallClick = () => {
    setActiveComponent("videoCall");
  };

  //현재 활성화된 컴포넌트를 렌더링하는 로직
  const renderActiveComponent = () => {
    console.log(roomId);
    switch (activeComponent) {
      case "videoCall":
        return <VideoCall roomId={roomId} recipientEmail={email} role={role}/>;
      case "channelChat":
      default:
        return <ChannelChat roomId={roomId} />;
    }
  };

  useEffect(() => {
    console.log("새로고침");
    const handleBeforeUnload = (event) => {
      setActiveComponent("channelChat");
      // 새로고침 시 리디렉션
      navigate('/channel/'+roomId+'/caller');
    };

    // 새로고침 감지
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 이벤트 리스너 정리
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  return (
      <>
        <div className="relative flex h-12 w-full items-center justify-between py-3 px-4">
          <div className="relative flex min-w-0 flex-auto items-center overflow-hidden">
            <Hash className="mr-2 overflow-hidden text-gray-500" size={24}/>
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {channelName}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeIcon/>
            <IconButton icon={"phoneCall"} tooltipText={"음성통화 하기"} onClick={handleVoiceCallClick}/>
            <IconButton icon={"videoCamera"} tooltipText={"영상통화 하기"} onClick={handleVideoCallClick}/>
            <IconButton icon={"userPlus"} tooltipText={"개인 메세지에 친구 추가하기"} onClick={openFriendAddModal}/>
            <SearchBar/>
            <IconButton icon={"inbox"} tooltipText={"받은 알림함"} onClick={openModal}/>
            <IconButton icon={"question"} tooltipText={"Help"}/>

            <Modal
                isOpen={friendAddModalIsOpen}
                onRequestClose={closeFriendAddModal}
                style={friendAddModalCustomStyles}
                contentLabel="Friend Add Modal"
                className="bg-gray-200 dark:bg-gray-700 border-gray-500 border-2"
                >
              <FriendListModal friends={friends} chatRoom={chatRoom} dispatch={dispatch}/>
            </Modal>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Notification Modal"
                className="bg-gray-200 dark:bg-gray-700 border-gray-500 border-2"
              >
              <NotificationList/>
            </Modal>
          </div>
        </div>
        {renderActiveComponent()}</>
  );
};

const FriendListModal = ({ friends, chatRoom, dispatch }) => {
    return (
        <div className="ml-4 relative flex w-4/5 flex-col dark:bg-gray-700">
          <List sx={{width: '100%'}}>
            {friends.map((friend) => (
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
                  <ListItemText primary={friend.friendName} />
                    <PlusCircle size={32} color="#77bb41" weight="fill" onClick={() => inviteChatRoom(friend, chatRoom, dispatch)}/>
                </ListItem>
            ))}
          </List>
        </div>
    );
};

const inviteChatRoom = async (friend, chatRoom, dispatch) => {
  const chatRoomInfo = {
    firstParticipantId: friend.friendMemberId,
    roomId: chatRoom.chatRoomInfo.roomId,
    roomName: chatRoom.chatRoomInfo.roomName,
  };

  try {
    const response = await sendRequestWithToken('/invite-chatRoom', chatRoomInfo, 'POST', dispatch);
    if (response.status === 409) {
      console.log('사용자가 채팅방에 이미 참여중입니다');
      return;
    }
    if (response.status === 200) {
      dispatch(addMemberToRoom({
        roomId: chatRoomInfo.roomId,
        newMember: response.data
      }));
    }
  } catch (e) {
    console.error('Error inviting to chat room:', e);
  }
};


const SearchBar = () => {
  return (
      <div className="flex items-center justify-end">
        <input
            type="text"
            placeholder="Search"
            className="h-6 w-36 rounded p-2 text-sm outline-none transition-all
                   duration-300 ease-in-out focus:w-60
                   motion-reduce:transition-none motion-reduce:focus:transform-none
                   dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500
                   bg-gray-300 text-gray-800 placeholder-gray-600"
        />
        <MagnifyingGlass className="absolute mr-2 dark:text-gray-400"/>
      </div>
  );
};

const IconButton = ({icon, tooltipText, onClick}) => {
  const iconProps = {
    className:
        "cursor-pointer dark:text-gray-400 dark:hover:text-gray-200 text-gray-600 hover:text-gray-800",
    weight: "fill",
    size: 24,
  };

  let iconEl;
  switch (icon) {
    case "phoneCall":
      iconEl = <PhoneCall {...iconProps} />;
      break;
    case "videoCamera":
      iconEl = <VideoCamera {...iconProps} />;
      break;
    case "userPlus":
      iconEl = <UserPlus {...iconProps} />;
      break;
    case "pin":
      iconEl = <PushPin {...iconProps} />;
      break;
    case "question":
      iconEl = <Question {...iconProps} />;
      break;
    case "inbox":
      iconEl = <Tray {...iconProps} onClick={onClick}/>;
      break;
    case "users":
      iconEl = <Users {...iconProps} />;
      break;
    default:
      break;
  }

  return (
      <div className="group relative flex flex-col items-center" onClick={onClick}>
        {iconEl}
        <Tooltip text={tooltipText}/>
      </div>
  );
};

const Tooltip = ({text = "Hello"}) => {
  return (
      <div
          className="pointer-events-none absolute top-full mt-1 hidden
                 flex-col items-center group-hover:flex"
      >
        <div className="-mb-2 h-3 w-3 rotate-45 bg-white dark:bg-black"></div>
        <div
            className="relative min-w-max rounded bg-white py-1.5 px-3 text-sm
                 text-gray-900 shadow-lg dark:bg-black dark:text-gray-100"
        >
          {text}
        </div>
      </div>
  );
};

const ThemeIcon = () => {
  const [darkTheme, setDarkTheme] = useDarkMode();
  const handleMode = () => setDarkTheme(!darkTheme);

  return (
    <span onClick={handleMode}>
      {darkTheme ? (
        <Sun
          size="24"
          weight="fill"
          className="cursor-pointer text-gray-600
                      transition duration-300 ease-in-out
                      hover:text-pink-400
                      dark:text-gray-400 hover:dark:text-pink-400"
        />
      ) : (
        <Moon
          size="24"
          weight="fill"
          className="cursor-pointer text-gray-600
                      transition duration-300 ease-in-out
                      hover:text-pink-400
                      dark:text-gray-400 hover:dark:text-pink-400"
        />
      )}
    </span>
  );
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

export default ChannelBar;
