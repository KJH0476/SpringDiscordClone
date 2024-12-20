package KoreatechJinJunGun.Win_SpringProject.chat.service;

import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.ChatRoomInfo;
import KoreatechJinJunGun.Win_SpringProject.chat.repository.ChatRoomInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ChatRoomInfoService {

    private final ChatRoomInfoRepository chatRoomInfoRepository;

    public ChatRoomInfo createAndAddChatRoomInfo(String roomId, String roomName){

        return chatRoomInfoRepository.findByRoomId(roomId)
                .orElseGet(() -> chatRoomInfoRepository.save(ChatRoomInfo.builder()
                        .roomId(roomId)
                        .roomName(roomName)
                        .createDate(new Date())
                        .build()
        ));
    }
}
