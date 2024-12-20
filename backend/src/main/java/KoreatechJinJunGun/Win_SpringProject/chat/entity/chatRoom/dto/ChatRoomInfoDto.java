package KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.dto;

import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.ChatRoomInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomInfoDto {

    private ChatRoomInfo chatRoomInfo;
    private List<ChatRoomMemberDto> memberList;
}
