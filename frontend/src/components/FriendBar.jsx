import {
    Bell,
    Chats,
    Hash,
    MagnifyingGlass,
    PushPin,
    Question,
    Tray,
    Users,
    Sun,
    Moon,
} from "@phosphor-icons/react";
import useDarkMode from "../hooks/useDarkMode";
import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import NotificationList from './NotificationList';
import '../index.css';
import {useSelector, useDispatch} from "react-redux";
import {sendRequestWithToken} from "../common/requestWithToken";
import {addFriends, setFriendFilter} from "../reducers/reducer/friendSlice";

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

Modal.setAppElement('#root');

const FriendBar = () => {
    const dispatch = useDispatch();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [FriendModalIsOpen, setFriendModalIsOpen] = useState(false);
    const currentFilter = useSelector(state => state.friend.filter);
    const friends = useSelector(state => state.friend.friends);

    const pendingFriendCount = friends.filter(friend => {
        return friend.relation === 'RECEIVED';
    }).length;

    const renderPendingFriendNotificationBadge = (count) => {
        if (count > 0) {
            return (
                <span
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/6 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold z-10">
                    {count}
                </span>
            );
        }
        return null;
    };

    useEffect(() => {
        dispatch(setFriendFilter('ONLINE_FRIENDS'));
    }, [dispatch]);

    function openModal() {
        setModalIsOpen(true);
    }

    function openRequestFriendModal() {
        setFriendModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function closeRequestFriendModal() {
        setFriendModalIsOpen(false);
    }

    const showOnlineFriends = () => {
        dispatch(setFriendFilter('ONLINE_FRIENDS'));
    };

    const showAllFriends = () => {
        dispatch(setFriendFilter('ALL_FRIENDS'));
    };

    const showPendingFriends = () => {
        dispatch(setFriendFilter('PENDING_FRIENDS'));
    };

    const getButtonClass = (filter) => {
        return `relative mx-2 text-base cursor-pointer items-center rounded px-4 py-1 font-semibold text-gray-700 dark:text-gray-100  ${
            currentFilter === filter
                ? "bg-gray-200 dark:bg-gray-600" // 활성 상태일 때 스타일
                : "hover:bg-gray-200 dark:hover:bg-gray-600" // 비활성 상태일 때 스타일
        }`;
    };

    return (
        <div className="relative flex h-12 w-full items-center justify-between py-3 px-4">
            <div className="relative flex min-w-0 flex-auto items-center overflow-hidden">
                <Users className="mx-2 overflow-hidden text-gray-500" size={24} weight="fill"/>
                <h1 className="mr-2.5 text-base font-semibold text-gray-700 dark:text-gray-100">
                    친구
                </h1>
                <h1 onClick={showOnlineFriends}
                    className={getButtonClass('ONLINE_FRIENDS')}>
                    온라인
                </h1>
                <h1 onClick={showAllFriends}
                    className={getButtonClass('ALL_FRIENDS')}>
                    모두
                </h1>
                <h1 onClick={showPendingFriends}
                    className={getButtonClass('PENDING_FRIENDS')}>
                    대기중
                    {renderPendingFriendNotificationBadge(pendingFriendCount)}
                </h1>
                <h1 onClick={openRequestFriendModal}
                    className="mx-2 text-base cursor-pointer items-center rounded px-4
                        py-1 text-white font-semibold bg-green-500">
                    친구 추가하기
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <ThemeIcon/>

                <SearchBar/>
                <IconButton icon={"inbox"} tooltipText={"Inbox"} onClick={openModal}/>
                <IconButton icon={"question"} tooltipText={"Help"}/>

                <Modal
                    className="dark:bg-gray-900"
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="Notification Modal"
                >
                    <NotificationList/>
                </Modal>
                <div className="flex items-center justify-center mx-auto">
                    <Modal
                        className="w-1/2 p-2 bg-white dark:bg-gray-900 rounded-md mx-auto"
                        isOpen={FriendModalIsOpen}
                        onRequestClose={closeRequestFriendModal}
                        contentLabel="Friend Modal"
                    >
                        <RequestBoxToFriend/>
                    </Modal>
                </div>

            </div>
        </div>
    );
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
            <MagnifyingGlass className="absolute mr-2 dark:text-gray-400" />
        </div>
    );
};

const RequestBoxToFriend = () => {
    const [inputValue, setInputValue] = useState('');
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const user = useSelector(state => state.user.userInfo);
    const dispatch = useDispatch();

    // 입력 필드의 값이 바뀔 때 호출되는 함수
    const handleInputChange = (e) => {
        // 입력된 값을 상태로 설정합니다.
        setInputValue(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            const response = await sendRequestWithToken('/request-friend', {
                memberName: user.username,
                friendName: inputValue
            }, 'POST', dispatch);
            if (response.status === 200) {
                // 요청 성공
                setMessage("요청에 성공했습니다."); // 성공 메시지 설정
                setMessageColor("text-green-500"); // 초록색으로 설정

                await sendRequestWithToken(`/find-all-friend/${user.id}/REQUESTED`, null, 'GET', dispatch)
                    .then(response => dispatch(addFriends(response.data)));
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage(error.response.data.message);
                setMessageColor("text-red-500");
            } else {
                setMessage("알 수 없는 오류가 발생했습니다.");
                setMessageColor("text-red-500");
                console.error('Error:', error);
            }
        }
    };

    return (
        <div
            className="ml-4 my-3 w-full cursor-pointer py-3 px-4">
            <div className="flex h-6 items-center">
                <input type="text" id="helper-text" aria-describedby="helper-text-explanation"
                       className="bg-gray-100 border border-gray-300 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block
                       w-3/5 p-2.5  dark:bg-black dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="사용자명을 입력해주세요."
                       value={inputValue}
                       onChange={handleInputChange}
                />
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="mx-2 flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                    친구요청
                </button>
            </div>
            {message && (
                <div className={`${messageColor} text-sm mt-2`}>
                    {message}
                </div>
            )}
        </div>
    );
}

const IconButton = ({icon, tooltipText, onClick}) => {
    const iconProps = {
        className:
            "cursor-pointer dark:text-gray-400 dark:hover:text-gray-200 text-gray-600 hover:text-gray-800",
        weight: "fill",
        size: 24,
    };

    let iconEl;
    switch (icon) {
        case "bell":
            iconEl = <Bell {...iconProps} />;
            break;
        case "threads":
            iconEl = <Chats {...iconProps} />;
            break;
        case "hashtag":
            iconEl = <Hash {...iconProps} />;
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
        <div className="group relative flex flex-col items-center" onClick={onclick}>
            {iconEl}
            <Tooltip text={tooltipText} />
        </div>
    );
};

const Tooltip = ({ text = "Hello" }) => {
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

export default FriendBar;
