package KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatDto {
    private String id;
    private String roomId;
    private String senderName;
    private String recipientName;
    private String content;
    private Date timestamp;
}
