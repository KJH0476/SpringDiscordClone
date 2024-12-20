import React, { useState } from 'react';
import { Microphone, Headphones, Gear } from "@phosphor-icons/react";
import { useSelector } from 'react-redux';
import Avatar from "@mui/material/Avatar";
import Modal from 'react-modal';

const customStyles = {
    content: {
        position: 'fixed', // 화면에 고정
        top: '220px', // 사용자 바의 높이를 고려해 조정
        bottom: '20px', // 사용자 바의 높이를 고려해 조정
        left: '80px', // 사용자 바의 왼쪽 패딩을 고려해 조정
        right: 'auto',
        transform: 'translate(0, 0)', // Y축 변환 없이 기본 위치 사용
        width: '20rem', // 모달의 너비
        height: '25rem', // 모달의 높이
        zIndex: 1000, // 모달의 z-index를 충분히 높게 설정
        borderRadius: '0.5rem',
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

const UserBar = () => {
    const user = useSelector((state) => state.user.userInfo);
    const [open, setOpen] = useState(false);

    const handleModalOpen = () => setOpen(true);
    const handleModalClose = () => setOpen(false);

    return (
      <div className="flex h-14 w-full items-center bg-gray-200 dark:bg-gray-900">
        <div className="flex flex-auto items-center p-2">
          <div className="flex w-full cursor-pointer gap-2 rounded p-1 dark:hover:bg-gray-700"  onClick={handleModalOpen}>
              <UserIcon user={user} />
              <UserName user={user} />
          </div>
          <ActionsIcons />
            <Modal
                isOpen={open}
                onRequestClose={handleModalClose}
                style={customStyles}
                contentLabel="UserInfo"
                className="bg-gray-200 dark:bg-gray-700 border-gray-500 border-2"
            >
                <UserInfo user={user} />
            </Modal>
        </div>
      </div>
    );
};

const UserIcon = ({user}) => {
  return (
    <div className="relative -ml-1 flex h-8 w-8">
      <Avatar
        className="rounded-full bg-white"
        alt={user.username} src="/static/images/avatar/1.jpg"
        sx={{ width: 30, height: 30 }}
      />
      <div
        className="absolute -bottom-1 -right-1  h-4 w-4
                   items-center justify-center rounded-full
                   bg-gray-200 text-center dark:bg-gray-900"
      >
        <div
          className="relative left-1/2 top-1/2 h-2.5 w-2.5 
                        -translate-x-1/2 -translate-y-1/2 rounded-full
                        bg-green-600 text-center"
        ></div>
      </div>
    </div>
  );
};

const UserName = ({user}) => {
  return (
    <div className="flex flex-col">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {user.username}
      </div>
      <div className="text-xs font-medium text-gray-500">{user.status}</div>
    </div>
  );
};

const ActionsIcons = () => {
  return (
    <div className="ml-auto flex">
      <div
        className="flex h-8 w-8 cursor-pointer items-center justify-center
                      rounded text-center dark:hover:bg-gray-700"
      >
        <Microphone
          className="cursor-pointer text-gray-600 hover:text-gray-800
                   dark:text-gray-400 dark:hover:text-gray-200"
          weight="fill"
          size={20}
        />
      </div>
      <div
        className="flex h-8 w-8 cursor-pointer items-center justify-center
                      rounded text-center dark:hover:bg-gray-700"
      >
        <Headphones
          className="cursor-pointer text-gray-600 hover:text-gray-800
                   dark:text-gray-400 dark:hover:text-gray-200"
          weight="fill"
          size={20}
        />
      </div>
      <div
        className="flex h-8 w-8 cursor-pointer items-center justify-center
                      rounded text-center dark:hover:bg-gray-700"
      >
        <Gear
          className="cursor-pointer text-gray-600 hover:text-gray-800
                   dark:text-gray-400 dark:hover:text-gray-200"
          weight="fill"
          size={20}
        />
      </div>
    </div>
  );
};

const UserInfo = ({user}) => {
    return (
        <div className="relative bg-gray-200 text-black dark:bg-gray-700 dark:text-white p-6 rounded-lg max-w-xs">
            <div className="flex items-center mb-4">
                <div className="relative">
                    <Avatar
                        className="h-16 w-16 rounded-full"
                        alt={user.username} src="/static/images/avatar/1.jpg"
                    />
                    <span className="absolute bottom-0 right-0 block h-4 w-4 bg-green-600 border-2 border-gray-800 rounded-full"></span>
                </div>
                <div className="ml-4">
                    <div className="text-lg font-bold">{user.username}</div>
                    <div className="text-sm">{user.email}</div>
                    <div className="text-sm text-gray-700 dark:text-white">가입일: {user.createdate}</div>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between my-3">
                    <div className="flex items-center">
                        <span className="block h-3 w-3 bg-green-600 rounded-full mr-2"></span>
                        <span>{user.status}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </div>

                <div className="flex items-center justify-between my-3">
                    <span>사용자 지정 상태 설정하기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </div>

                <div className="flex items-center justify-between my-3">
                    <span>계정 바꾸기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default UserBar;
