package KoreatechJinJunGun.Win_SpringProject.chat.service;

import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage.ChatDto;
import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage.ChatMessage;
import KoreatechJinJunGun.Win_SpringProject.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {
    
    private final ChatMessageRepository chatMessageRepository;

    public ChatMessage save(ChatMessage chatMessage) {
        return chatMessageRepository.save(chatMessage);
    }

    public List<ChatDto> findChatMessages(String roomId) {
        List<ChatMessage> chatMessages = chatMessageRepository.findByRoomId(roomId);
        return chatMessages.stream()
                .map(chatMsg -> ChatDto.builder()
                        .id(chatMsg.getId())
                        .roomId(chatMsg.getRoomId())
                        .senderName(chatMsg.getSenderName())
                        .content(chatMsg.getContent())
                        .timestamp(chatMsg.getTimestamp())
                        .build())
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .collect(Collectors.toList());
    }
}
