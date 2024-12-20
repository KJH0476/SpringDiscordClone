package KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomMemberDto {

    private String email;
    private String name;
    private String nickname;
}
