import React, {useEffect, useState, useRef} from 'react';
import {stompClient} from "../common/webSocketService";
import {useSelector} from "react-redux";
import {eventEmitter} from "../common/eventSystem";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";
import {useNavigate, useParams} from "react-router-dom";

export const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

export let otherKeyList = [];
export let localStream = undefined;
let myEmail;
export const iceCandidatesQueue = new Map();

const VideoCall = ({roomId, recipientEmail, role}) => {
    const [localStreams, setLocalStream] = useState(null);
    const [callEnded, setCallEnded] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const member = useSelector(state => state.user.userInfo);
    const navigate = useNavigate();

    otherKeyList.push(recipientEmail);
    myEmail = member.email;

    // 통화 종료
    const endCall = () => {
        localStream.getTracks().forEach(track => track.stop()); // 모든 트랙을 중지
        remoteStreams.clear(); // 상대방 스트림 초기화
        otherKeyList = []; // 상대방 키 초기화
        stompClient.send(`/app/exitCall/${recipientEmail}`, {}, JSON.stringify({
            email: myEmail,
            roomId: roomId,
            message: "상대방이 통화를 종료했습니다."
        }));
        console.log('통화 종료');
        setCallEnded(true);
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(async (stream) => {
                setLocalStream(stream);
                localStream = stream;
                stream.getAudioTracks()[0].enabled = true;
                otherKeyList.push(recipientEmail);

                console.log('getMedia Success:', localStream);

                if (role === 'caller') {
                    await stompClient.send(`/app/requestCall/${recipientEmail}`, {}, JSON.stringify({
                        email: myEmail,
                        roomId: roomId,
                        message: "request videoCall"
                    }));
                }
            })
            .catch(error => {
                console.error('미디어 스트림 획득 실패:', error);
            });

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
        };
    }, [roomId, recipientEmail, role]);


    useEffect(() => {
        const handleTrackEvent = ({event, recipientEmail}) => {
            console.log('handle Track event:', event, recipientEmail);
            // 상태 업데이트 시 기존 상태를 복사하고 새 항목 추가
            setRemoteStreams(prevRemoteStreams => new Map(prevRemoteStreams).set(recipientEmail, event.streams[0]));
        };

        eventEmitter.on('track', handleTrackEvent);

        return () => {
            eventEmitter.off('track', handleTrackEvent);
        };
    }, []);

    useEffect(() => {
        const handleUnload = (event) => {
            endCall();
            window.location.href = '/';
        };

        // 새로고침 및 탭 닫기 감지
        window.addEventListener('unload', handleUnload);

        // 이벤트 리스너 정리
        return () => {
            window.removeEventListener('unload', handleUnload);
        };
    }, []);

    return (
        <div className="flex flex-col flex-1 items-center justify-center">
            {callEnded && <p className="text-3xl font-bold text-red-500">통화가 종료되었습니다.</p>}
            <div className="flex flex-row items-start justify-center w-full">
                <div className="flex flex-col p-4 gap-4 items-center">
                    <div className="relative aspect-video flex-1 border-4 rounded-lg">
                        <video autoPlay playsInline muted
                               ref={element => element && localStreams && (element.srcObject = localStreams)}></video>
                        <p className="text-gray-600 dark:text-gray-300 font-semibold text-center">{member.nickname}</p>
                    </div>
                </div>
                <div className="flex flex-col p-4 gap-4 items-center">
                    {[...remoteStreams.entries()].map(([email, stream]) => (
                        <div key={email} className="relative aspect-video flex-1 border-4 rounded-lg">
                            <RemoteVideo stream={stream}/>
                            <p className="text-gray-600 dark:text-gray-300 font-semibold text-center">{email}</p>
                        </div>
                    ))}
                </div>
            </div>

            <SideBarIcon
                icon={<HiOutlinePhoneMissedCall size={36} className="flex-3" onClick={endCall}/>}
                isServerIcon={true}
            />
        </div>
    );
};

const SideBarIcon = ({icon, isActive = false, isServerIcon = false,}) => (
    <div className='group relative my-10 mb-2 min-w-min px-3'>
        <div
            className={`callend-icon ${isActive ? 'active' : ''} ${
                !isServerIcon
                    ? 'text-red-500 hover:bg-red-500 dark:text-red-500 dark:hover:bg-red-500 dark:hover:text-white'
                    : ''
            }`}
        >
            {icon}{' '}
        </div>
    </div>
);

const RemoteVideo = ({stream, email}) => {
    const videoRef = useRef(null);

    console.log('RemoteVideo:', email, stream);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div>
            <video autoPlay playsInline ref={videoRef}></video>
        </div>
    );
};


export const createPeerConnection = async (roomId, myEmail, recipientEmail) => {
    const pc = new RTCPeerConnection(configuration);
    try {
        // 만약 localStream 이 존재하면 peerConnection에 addTrack 으로 추가함
        if (localStream !== undefined) {
            console.log('localStream:', localStream);
            await localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            localStream = stream;
            stream.getAudioTracks()[0].enabled = true;
            otherKeyList.push(recipientEmail);
            await localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }
        // peerConnection 에서 icecandidate 이벤트가 발생시 onIceCandidate 함수 실행
        pc.addEventListener('icecandidate', (event) => {
            onIceCandidate(event, roomId, myEmail, recipientEmail);
        });
        // peerConnection 에서 track 이벤트가 발생시 onTrack 함수를 실행
        pc.addEventListener('track', (event) => {
            console.log('Track event:', event);
            eventEmitter.emit('track', {event, recipientEmail});
            //VideoCall.onTrack(event, recipientEmail);
        });
        console.log('PeerConnection created');
    } catch (error) {
        console.error('PeerConnection failed: ', error);
    }
    return pc;
}


//onIceCandidate
export let onIceCandidate = (event, roomId, myEmail, recipientEmail) => {
    if (event.candidate) {
        console.log('ICE candidate');
        stompClient.send(`/app/videoCall/iceCandidate/${recipientEmail}/${roomId}`, {}, JSON.stringify({
            key: myEmail,
            body: event.candidate
        }));
    }
};

export let sendOffer = async (pc, roomId, recipientEmail) => {
    pc.createOffer().then(offer => {
        setLocalAndSendMessage(pc, offer);
        stompClient.send(`/app/videoCall/offer/${recipientEmail}/${roomId}`, {}, JSON.stringify({
            key: myEmail,
            body: offer
        }));
        console.log('Send offer');
    });
};

//email : 상대방 이메일
export let sendAnswer = async (pc, roomId, myEmail, senderEmail) => {
    setTransceiverDirection(pc, 'sendrecv');
    pc.createAnswer().then(answer => {
        setLocalAndSendMessage(pc, answer);
        stompClient.send(`/app/videoCall/answer/${senderEmail}/${roomId}`, {}, JSON.stringify({
            key: myEmail,
            body: answer
        }));
        console.log('Send answer');
    });
};

function setTransceiverDirection(pc, direction) {
    const transceivers = pc.getTransceivers();

    transceivers.forEach(transceiver => {
        transceiver.direction = direction;
    });
}

const setLocalAndSendMessage = async (pc, sessionDescription) => {
    await pc.setLocalDescription(sessionDescription);
}

export default VideoCall;
