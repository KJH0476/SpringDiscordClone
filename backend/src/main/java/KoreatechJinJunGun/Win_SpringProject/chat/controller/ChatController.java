package KoreatechJinJunGun.Win_SpringProject.chat.controller;

import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage.ChatDto;
import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage.ChatMessage;
import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage.ChatNotification;
import KoreatechJinJunGun.Win_SpringProject.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/{roomId}")
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage chatMsg = chatMessageService.save(chatMessage);
        simpMessagingTemplate.convertAndSend("/topic/messages/"+chatMsg.getRoomId(),
                ChatNotification.builder()
                        .roomId(chatMsg.getRoomId())
                        .senderName(chatMsg.getSenderName())
                        .content(chatMsg.getContent())
                        .build()
        );
    }

    @GetMapping("/messages/{roomId}")
    public ResponseEntity<List<ChatDto>> findChatMessages(@PathVariable("roomId") String roomId) {
        return ResponseEntity.ok(chatMessageService.findChatMessages(roomId));
    }
}
