import {stompClient} from "./webSocketService";
import { otherKeyList } from "../components/VideoCall";
import {createPeerConnection, sendOffer, sendAnswer, iceCandidatesQueue} from "../components/VideoCall";
import {setVideo} from "../reducers/reducer/videoCallSlice";
import {addNotification} from "../reducers/reducer/notificationSlice";
import {incrementUnreadCount} from "../reducers/reducer/unreadMessagesSlice";

export const pcListMap = new Map();

export const peerConfig = async (id, email, dispatch) => {
    /**
     * WebRtc
     */
    const roomId = id;
    const myEmail = email;

    stompClient.subscribe(`/topic/videoCall/offer/${myEmail}/${roomId}`, async offer => {
        const senderEmail = JSON.parse(offer.body).key;
        const message = JSON.parse(offer.body).body;

        console.log('[offer] senderEmail: ', senderEmail);
        console.log('Received offer:', message, roomId);

        //해당 key에 새로운 peerConnection 를 생성해준후 pcListMap 에 저장해준다.
        const pc = await createPeerConnection(roomId, myEmail, senderEmail);
        pcListMap.set(senderEmail, pc);
        console.log('pcListMap:', pcListMap);
        try {
            //생성한 peer 에 offer정보를 setRemoteDescription 해준다.
            //await pcListMap.get(senderEmail).setRemoteDescription(new RTCSessionDescription({type:message.type,sdp:message.sdp}));
            await pc.setRemoteDescription(new RTCSessionDescription({
                type: message.type,
                sdp: message.sdp
            }));
            console.log('Set remote description success.');
            console.log('senderEmail:', senderEmail);

            //sendAnswer 함수를 호출
            await sendAnswer(pcListMap.get(senderEmail), roomId, myEmail, senderEmail);

            const pcKey = `${senderEmail}-${roomId}`;
            if (iceCandidatesQueue.has(pcKey)) {
                const candidates = iceCandidatesQueue.get(pcKey);
                candidates.forEach(candidate => {
                    console.log('Adding ICE candidate from queue.');
                    pcListMap.get(senderEmail).addIceCandidate(new RTCIceCandidate(candidate));
                });
                iceCandidatesQueue.delete(pcKey); // 처리된 후보는 큐에서 제거
            }
        } catch (error) {
            console.error("Failed to set remote description:", error);
        }
    });

    stompClient.subscribe(`/topic/videoCall/answer/${myEmail}/${roomId}`, async (answer) => {
        const senderEmail = JSON.parse(answer.body).key;
        const message = JSON.parse(answer.body).body;

        console.log('[answer] senderEmail: ', senderEmail);
        console.log('Received answer: ', message);

        const pc = pcListMap.get(senderEmail);
        if (!pc) {
            console.error(`PeerConnection not found for sender: ${senderEmail}`);
            return;
        }

        try {
            //setRemoteDescription 생성
            await pc.setRemoteDescription(new RTCSessionDescription({
                type: message.type,
                sdp: message.sdp
            }));
            console.log('Set remote description success for answer.');

            // setRemoteDescription 성공 후, 큐에 저장된 ICE 후보를 처리
            const pcKey = `${senderEmail}-${roomId}`;
            if (iceCandidatesQueue.has(pcKey)) {
                const candidates = iceCandidatesQueue.get(pcKey);
                for (const candidate of candidates) {
                    console.log('Adding ICE candidate from queue for answer.');
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                iceCandidatesQueue.delete(pcKey); // 처리된 후보는 큐에서 제거
            }
        } catch (error) {
            console.error("Failed to process answer or add ICE candidate:", error);
        }
    });


    stompClient.subscribe(`/topic/videoCall/iceCandidate/${myEmail}/${roomId}`, async (candidate) => {
        const senderEmail = JSON.parse(candidate.body).key;
        const message = JSON.parse(candidate.body).body;
        console.log('Received ICE candidate:', senderEmail, message, roomId);

        const pcKey = `${senderEmail}-${roomId}`;
        const pc = pcListMap.get(senderEmail);

        await addQueueIceCandidate(pc, pcKey, message);
    });


    //key를 보내라는 신호를 받은 subscribe
    stompClient.subscribe(`/topic/requestCall/${myEmail}`, message =>{
        const messageBody = JSON.parse(message.body);

        console.log('Received call key:', messageBody.email);
        dispatch(setVideo({ videoCall: true, senderEmail: messageBody.email, roomId: messageBody.roomId }));
    });

    //상대방의 key를 받는 subscribe
    stompClient.subscribe(`/topic/receiveCall/${myEmail}`, async message => {
        const messageBody = JSON.parse(message.body);
        //messageBody.email 상대방 이메일
        //만약 중복되는 키가 ohterKeyList에 있는지 확인하고 없다면 추가
        if(email !== messageBody.email && otherKeyList.find((mapKey) => mapKey === messageBody.email) === undefined){
            otherKeyList.push(messageBody.email);
            console.log('otherKeyList:', otherKeyList);
        }
        if(messageBody.message === 'accept') {
            if (!pcListMap.has(messageBody.email)) {
                console.log('accept and Create PeerConnection:', messageBody.email);
                const pc = await createPeerConnection(messageBody.roomId, myEmail, messageBody.email);
                pcListMap.set(messageBody.email, pc);
                console.log('pcListMap:', pcListMap);
                await sendOffer(pc, messageBody.roomId, messageBody.email); // 이 함수는 비동기적으로 실행
            }
        }
    });

    stompClient.subscribe(`/topic/exitCall/${myEmail}`, message =>{
        const messageBody = JSON.parse(message.body);

        console.log('exit call:', messageBody.email);
        if(pcListMap.has(messageBody.email)){
            pcListMap.get(messageBody.email).close();
            pcListMap.delete(messageBody.email);
        }
    });

    stompClient.subscribe(`/topic/messages/${roomId}`, message => {
        const messageBody = JSON.parse(message.body);
        dispatch(incrementUnreadCount(roomId));
        console.log('Received message:', messageBody);
    });
}

const addQueueIceCandidate = async (pc, pcKey, message) => {

    console.log('addQueueIceCandidate:', pc, pcKey, message);

    if (pc && pc.remoteDescription) { //pc가 존재하고, 원격 설명이 이미 설정되어 있다면
        console.log('PeerConnection 준비 O -> ICE candidate 바로 추가');
        try {
            await pc.addIceCandidate(new RTCIceCandidate({
                candidate: message.candidate,
                sdpMLineIndex: message.sdpMLineIndex,
                sdpMid: message.sdpMid
            }));
            iceCandidatesQueue.delete(pcKey); // 처리된 후보는 큐에서 제거
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    } else {
        //PeerConnection이 준비되지 않았거나 원격 설명이 설정되지 않았다면 iceCandidate를 임시 저장소에 저장
        console.log('PeerConnection 준비 X -> ICE candidate 큐에 추가');
        if (!iceCandidatesQueue.has(pcKey)) {
            iceCandidatesQueue.set(pcKey, []);
        }
        iceCandidatesQueue.get(pcKey).push(message);
    }
}