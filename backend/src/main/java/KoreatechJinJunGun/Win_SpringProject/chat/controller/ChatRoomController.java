package KoreatechJinJunGun.Win_SpringProject.chat.controller;

import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.ChatRoom;
import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.ChatRoomInfo;
import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.dto.ChatRoomDto;
import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.dto.ChatRoomInfoDto;
import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.dto.ChatRoomMemberDto;
import KoreatechJinJunGun.Win_SpringProject.chat.service.ChatRoomInfoService;
import KoreatechJinJunGun.Win_SpringProject.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomInfoService chatRoomInfoService;
    private final ChatRoomService chatRoomService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/add-chatRoom")
    public ResponseEntity<List<ChatRoomInfoDto>> createChatRoom(@RequestBody ChatRoomDto ch) {
        ChatRoomInfo newChatRoomInfo = chatRoomInfoService.createAndAddChatRoomInfo(ch.getRoomId(), ch.getRoomName());

        List<ChatRoom> chatRooms = chatRoomService.addChatRoom(newChatRoomInfo, ch);

        notifyCreateChatRoom(chatRooms);

        List<ChatRoomInfoDto> chatRoomInfos = chatRoomService.findChatRoomInfoByChatRoom(ch.getFirstParticipantId());

        return new ResponseEntity<>(chatRoomInfos, HttpStatus.OK);
    }

    @PostMapping("/invite-chatRoom")
    public ResponseEntity<?> inviteChatRoom(@RequestBody ChatRoomDto ch) {
        ChatRoomInfo newChatRoomInfo = chatRoomInfoService.createAndAddChatRoomInfo(ch.getRoomId(), ch.getRoomName());

        ChatRoom chatRoom = chatRoomService.plusMemberInChatRoom(newChatRoomInfo, ch.getFirstParticipantId());

        notifyCreateChatRoom(new ArrayList<>(Collections.singletonList(chatRoom)));

        if (chatRoom == null) {
            //이미 채팅방에 사용자가 참여중일 경우, 409 상태코드와 함께 메시지 반환
            return ResponseEntity.status(HttpStatus.CONFLICT).body("사용자가 이미 채팅방에 참여중입니다.");
        }

        return new ResponseEntity<>(
                ChatRoomMemberDto.builder()
                        .email(chatRoom.getMemberId().getEmail())
                        .name(chatRoom.getMemberId().getUsername())
                        .nickname(chatRoom.getMemberId().getNickname())
                        .build(),
                HttpStatus.OK
        );
    }

    @GetMapping("/find-chatRoom/{memberId}")
    public ResponseEntity<List<ChatRoomInfoDto>> findChatRoomByMember(@PathVariable("memberId") Long memberId){
        List<ChatRoomInfoDto> chatRoomInfos = chatRoomService.findChatRoomInfoByChatRoom(memberId);

        return new ResponseEntity<>(chatRoomInfos, HttpStatus.OK);
    }

    private void notifyCreateChatRoom(List<ChatRoom> chatRooms) {
        chatRooms.forEach(chatRoom ->
                simpMessagingTemplate.convertAndSendToUser(
                        chatRoom.getMemberId().getEmail(),
                        "/newChatRoom",
                        chatRoomService.findChatRoomInfoByChatRoom(chatRoom.getMemberId().getId())
                ));
    }
}
