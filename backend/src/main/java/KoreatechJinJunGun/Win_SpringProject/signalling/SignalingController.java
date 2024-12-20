package KoreatechJinJunGun.Win_SpringProject.signalling;

import KoreatechJinJunGun.Win_SpringProject.signalling.dto.IceMessage;
import KoreatechJinJunGun.Win_SpringProject.signalling.dto.CallMessage;
import KoreatechJinJunGun.Win_SpringProject.signalling.dto.OfferAnswerMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class SignalingController {

    /**
     * roomId: 룸 아이디
     * email: 상대방 이메일
     */
    //Offer 전달
    @MessageMapping("/videoCall/offer/{email}/{roomId}")
    @SendTo("/topic/videoCall/offer/{email}/{roomId}")
    public OfferAnswerMessage sendOffer(@Payload OfferAnswerMessage offer, @DestinationVariable(value = "email") String email,
                                              @DestinationVariable(value = "roomId") String roomId) {
        log.info("[{}] Offer Send to {}", roomId, email);
        return offer;
    }

    //Answer 전달
    @MessageMapping("/videoCall/answer/{email}/{roomId}")
    @SendTo("/topic/videoCall/answer/{email}/{roomId}")
    public OfferAnswerMessage sendAnswer(@Payload OfferAnswerMessage answer, @DestinationVariable(value = "email") String email,
                                   @DestinationVariable(value = "roomId") String roomId) {
        log.info("[{}] Answer Send to {}", roomId, email);
        return answer;
    }

    //IceCandidate 협상
    @MessageMapping("/videoCall/iceCandidate/{email}/{roomId}")
    @SendTo("/topic/videoCall/iceCandidate/{email}/{roomId}")
    public IceMessage negotiationIceCandidate(@Payload IceMessage candidate, @DestinationVariable(value = "email") String email,
                                             @DestinationVariable(value = "roomId") String roomId) {
        log.info("[{}] IceCandidate Send to {}", roomId, email);
        return candidate;
    }

    //화상 통화 요청
    @MessageMapping("/requestCall/{email}")
    @SendTo("/topic/requestCall/{email}")
    public CallMessage requestCall(@Payload CallMessage message, @DestinationVariable(value = "email") String email) {
        log.info("Request VideoCall to {}", message.getEmail());
        return message;
    }

    //화상 통화 수락
    @MessageMapping("/receiveCall/{email}")
    @SendTo("/topic/receiveCall/{email}")
    public CallMessage receiveCall(@Payload CallMessage message, @DestinationVariable(value = "email") String email) {
        log.info("Receive VideoCall to {}", message.getEmail());
        return message;
    }

    //화상 통화 종료
    @MessageMapping("/exitCall/{email}")
    @SendTo("/topic/exitCall/{email}")
    public CallMessage exitCall(@Payload CallMessage message, @DestinationVariable(value = "email") String email) {
        log.info("Receive VideoCall to {}", message.getEmail());
        return message;
    }
}
