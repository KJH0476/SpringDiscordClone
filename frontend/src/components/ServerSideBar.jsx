import React, { useState } from "react";
import { Hash } from "@phosphor-icons/react";
import { RxCaretDown, RxCaretRight } from "react-icons/rx";
import {Users} from "@phosphor-icons/react";
import {useNavigate, useLocation} from "react-router-dom";
import { useSelector } from "react-redux";
import {selectUnreadCountByRoomId} from "../reducers/reducer/unreadMessagesSlice";

const ServerSideBar = () => {
    const location = useLocation();
    const chatRooms = useSelector((state) => state.chatRoom.chatRoom);

    console.log("chatRooms :", chatRooms);

  return (
    <div
      className="relative top-0 flex h-full
                  min-w-[240px] flex-col items-center
                  bg-gray-100
                  dark:bg-gray-800 dark:text-gray-100"
    >
      <Header serverName={"ConcordiaGaming"} />
      <Divider />
        <FriendsSection active={location.pathname === "/"} />
      <Section sectionName={"다이렉트 메세지"} channels={chatRooms} />
    </div>
  );
};

const Header = () => {
  const [serverName, setServerName] = useState(""); // 서버 이름 상태 관리

  return (
      <div
          className="w-full cursor-pointer py-3 px-4
                  transition-colors duration-100
                  hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        <div className="flex h-6 items-center">
          <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)} // 입력값 변경 처리
              className="flex-1 bg-transparent border-none
                     text-ellipsis whitespace-nowrap text-base font-semibold
                     dark:text-gray-100"
              placeholder="대화찾기 또는 시작하기"
          />
        </div>
      </div>
  );
};

const Divider = () => (
  <hr
    className="m-0 w-full border
                border-gray-400 bg-gray-400 p-0
                dark:border-gray-900 dark:bg-gray-900"
  />
);

const FriendsSection = ({active}) => {
    let navigate = useNavigate();
    return (
        <div className="flex w-full flex-col">
        <div
            className={`mx-2 my-4 flex cursor-pointer items-center rounded px-2 
            py-1 text-gray-500 hover:bg-gray-300 hover:text-gray-600 
            dark:hover:bg-gray-700 dark:hover:text-gray-400 
            ${active ? "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400" : ""}`}
            onClick={() => navigate(`/`)}
        >
            <Users className="text-gray-500 mx-1" size={24} weight="fill" />
            <p className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold">친구</p>
        </div>
        </div>
    );
};

const Section = ({sectionName = "Text Channels", channels}) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="flex w-full flex-col">
            <div
        className="mb-1 flex cursor-pointer items-center pt-4 
                    text-gray-500 hover:text-gray-700
                    dark:text-gray-400 dark:hover:text-gray-100"
      >
        <div
          className="flex flex-auto items-center"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex w-6 items-center justify-center">
            {expanded ? <RxCaretDown /> : <RxCaretRight />}
          </div>
          <span className="text-xs font-bold uppercase">{sectionName}</span>
        </div>
      </div>
      {channels &&
        channels.map((channel) => (
          <ChannelItem key={channel.chatRoomInfo.id} channel={channel} isSectionExpanded={expanded} />
        ))}
    </div>
  );
};

const ChannelItem = ({ channel, isSectionExpanded = true }) => {
    let navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === `/channel/${channel.friendName}`;

    const unreadCount = useSelector(state => selectUnreadCountByRoomId(state, channel.chatRoomInfo.roomId));

    console.log("channel :", channel);
    console.log("unreadCount :", unreadCount);

  return (
    <div className={`${!isSectionExpanded && !channel.active ? "hidden" : ""}`}>
      <div
        className={`mx-2 my-0.5 flex cursor-pointer items-center rounded px-2 
                    py-1 text-gray-500 hover:bg-gray-300 hover:text-gray-600
                    dark:hover:bg-gray-700 dark:hover:text-gray-400
                    ${isActive ? "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400" : ""}`}
        onClick={() => navigate(`/channel/${channel.chatRoomInfo.roomId}/caller`)}
      >
        <Hash className="text-gray-500" size={24} />
        <p className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium">
          {formatChatRoomParticipants(channel.memberList)}
        </p>
          {renderUnreadMessageCount(unreadCount)}
      </div>
    </div>
  );
};

const renderUnreadMessageCount = (count) => {
    if (count > 0) {
        return (
            <span
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold z-10">
                    {count}
                </span>
        );
    }
    return null;
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

export default ServerSideBar;
