package KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDto {

    private Long firstParticipantId;
    private Long secondParticipantId;
    private String roomId;
    private String roomName;
}
