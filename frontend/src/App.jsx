import SideBar from './components/SideBar.jsx';
import ServerSideBar from './components/ServerSideBar';
import UserBar from './components/UserBar';
import SignIn from './components/SignIn';
import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import WebSocketConnection from './components/WebSocketConnection';
import FriendHome from "./components/FriendHome";
import {LoadUserInformation} from './components/LoadUserInformation';
import {useDispatch, useSelector} from 'react-redux';
import ChannelBar from "./components/ChannelBar";
import VideoCallModal from "./components/VideoCallModal";
import {stompClient} from "./common/webSocketService";
import {setVideo} from "./reducers/reducer/videoCallSlice";
import {selectRoomInfoByEmail, selectRoomInfoByRoomId} from "./reducers/reducer/chatRoomSlice";
import {useEffect} from "react";

function App() {
    const member = useSelector(state => state.user.userInfo);
    const isLoggedIn = useSelector(state => state.user.isLoggedIn);
    const isLoading = useSelector(state => state.user.loading);
    const videoCall = useSelector(state => state.videoCall.videoCall)
    const videoCallEmail = useSelector(state => state.videoCall.senderEmail);
    const videoCallRoomId = useSelector(state => state.videoCall.roomId);
    //const chatRoomInfo = useSelector((state) => selectRoomInfoByEmail(state, videoCallEmail));
    //const chatRoomInfo = useSelector((state) => selectRoomInfoByRoomId(state, videoCallRoomId));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleAcceptCall = () => {
        // 여기에 stompClient.send 로직 구현
        const myKeyBody = {
            email: member.email,
            roomId: videoCallRoomId,
            message: "accept"
        };
        stompClient.send(`/app/receiveCall/${videoCallEmail}`, {}, JSON.stringify(myKeyBody));

        // 영상통화 모달 닫기
        dispatch(setVideo(false));

        if (videoCallRoomId) {
            navigate(`/channel/${videoCallRoomId}/receiver`);
        } else {
            console.error('Chat room not found');
        }
    };

    return (
        <>
            {!isLoggedIn ? (
                <SignIn/>
            ) : (
                <>
                    {!isLoading && <LoadUserInformation />}
                    <WebSocketConnection />
                    <div className='flex h-screen'>
                        <SideBar />
                        <div className='flex flex-col h-full'>
                            <ServerSideBar />
                            <UserBar />
                        </div>
                        <div className="relative flex w-full h-full flex-col dark:bg-gray-700">
                            <Routes>
                                <Route path="/" element={<FriendHome />} />
                                <Route path="/channel/:roomId/:role" element={<ChannelBar />} />
                            </Routes>
                        </div>
                    </div>
                    {videoCall && <VideoCallModal isOpen={videoCall} onClose={() => dispatch(setVideo(false))} onAccept={handleAcceptCall} />}
                </>
            )}
        </>
    );
}

export default App;
