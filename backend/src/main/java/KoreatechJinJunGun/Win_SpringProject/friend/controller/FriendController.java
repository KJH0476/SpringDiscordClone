package KoreatechJinJunGun.Win_SpringProject.friend.controller;

import KoreatechJinJunGun.Win_SpringProject.friend.entity.FriendDto;
import KoreatechJinJunGun.Win_SpringProject.friend.entity.FriendForm;
import KoreatechJinJunGun.Win_SpringProject.friend.entity.FriendRelation;
import KoreatechJinJunGun.Win_SpringProject.friend.service.FriendService;
import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import KoreatechJinJunGun.Win_SpringProject.member.entity.Status;
import KoreatechJinJunGun.Win_SpringProject.member.service.MemberService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final MemberService memberService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    //친구 조회
    //memberId: 현재 로그인한 사용자 Id, status: FRIENDS(친구 관계), REQUESTED(보낸 요청), RECEIVED(받은 요청)
    @GetMapping("/find-all-friend/{memberId}/{relationType}")
    public ResponseEntity<List<FriendDto>> searchAllFriend(@PathVariable("memberId") Long memberId, @PathVariable("relationType") FriendRelation relationType) throws JsonProcessingException {
        List<FriendDto> friends = friendService.findFriend(memberId, relationType);

        return new ResponseEntity<>(friends, HttpStatus.OK);
    }

    @GetMapping("/find-online-friend/{memberId}/{relationType}")
    public ResponseEntity<List<FriendDto>> searchOnlineFriend(@PathVariable("memberId") Long memberId,
                                                              @PathVariable("relationType") FriendRelation relationType) throws JsonProcessingException {
        List<FriendDto> friends = friendService.findOnlineFriend(memberId, relationType);

        return new ResponseEntity<>(friends, HttpStatus.OK);
    }

    //친구 요청
    @PostMapping("/request-friend")
    public ResponseEntity<Map<String, String>> addFriend(@RequestBody FriendForm friendForm) {
        String friendEmail = friendService.requestFriend(friendForm);

        //웹소켓 실시간 요청 알림을 친구에게 보냄
        sendFriendRequestNotification(friendEmail, "REQUESTED", friendForm.getMemberName(), friendForm.getMemberName() + " 님이 친구 요청을 보냈습니다.");
        log.info("친구 요청 완료 {} -> {}", friendForm.getMemberName(), friendForm.getFriendName());

        return new ResponseEntity<>(getResponseBody("새로운 친구 요청"), HttpStatus.OK);
    }

    //친구 수락
    @PostMapping("/received-friend")
    public ResponseEntity<Map<String, String>> okFriend(@RequestBody FriendForm friendForm){
        Member friendMember = friendService.receivedFriend(friendForm.getMemberName(), friendForm.getFriendName());

        sendFriendRequestNotification(friendMember.getEmail(), "ACCEPTED", friendForm.getMemberName(),friendForm.getMemberName()+" 님과 친구가 되었습니다.");

        return new ResponseEntity<>(getResponseBody("친구 요청을 수락하였습니다."), HttpStatus.OK);
    }

    //친구 삭제, 거절
    @PostMapping("/delete-friend")
    public ResponseEntity<Map<String, String>> removeFriend(@RequestBody FriendForm friendForm){
        Member friendMember = friendService.removeEachFriend(friendForm.getMemberName(), friendForm.getFriendName());

        sendFriendRequestNotification(friendMember.getEmail(), "REFUSED", friendForm.getMemberName(), friendForm.getMemberName()+" 님이 친구 요청을 거절하였습니다.");

        return new ResponseEntity<>(getResponseBody("친구를 삭제하였습니다."), HttpStatus.OK);
    }

    //사용자가 온라인 오프라인 변할때 사용자의 친구들에게 친구 리스트 새로고침 메세지 보냄
    @GetMapping("/update-status/{memberId}/{status}")
    public ResponseEntity<Map<String, String>> clientConnectChange(@PathVariable("memberId") Long memberId, @PathVariable("status") Status status){
        memberService.updateOnlineOffline(memberId, status);
        sendRefreshFriendList(memberId, memberId.toString()+"_"+status.toString());
        return new ResponseEntity<>(getResponseBody("update user for " + status), HttpStatus.OK);
    }

    //친구 요청 사용자를 찾을 수 없는 경우 -> 400
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNoSuchElementException(NoSuchElementException ex) {

        return new ResponseEntity<>(getResponseBody(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    //친구 요청 알림 메세지 전달
    public void sendFriendRequestNotification(String friendEmail, String type, String name, String message){
        Map<String, String> sendMessage = new ConcurrentHashMap<>();
        sendMessage.put("type", type);
        sendMessage.put("name", name);
        sendMessage.put("message", message);
        //특정 사용자에게 메시지를 보내려 할 때 convertAndSendToUser 메서드의 첫 번째 인자는 SpringSecurity 가 관리하는 사용자 식별자와 일치해야 함
        //현재 SpringSecurity 가 관리하는 식별자는 Email
        simpMessagingTemplate.convertAndSendToUser(friendEmail, "/queue/Notification", sendMessage);
    }

    //친구들에게 온라인, 오프라인 변경 여부 전달
    public void sendRefreshFriendList(Long memberId, String sendMessage){
        log.info("reloadFriendList");
        List<FriendDto> friend = friendService.findFriend(memberId, FriendRelation.FRIENDS);
        for (FriendDto friendDto : friend) {
            simpMessagingTemplate.convertAndSendToUser(friendDto.getFriendEmail(), "/queue/reloadFriendList", sendMessage);
        }
    }

    //응답 바디 만드는 메소드
    private Map<String, String> getResponseBody(String message){
        Map<String, String> body = new ConcurrentHashMap<>();
        body.put("message", message);
        return body;
    }
}
