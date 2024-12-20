package KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatNotification {
    private String roomId;
    private String senderName;
    private String content;
    private Date timestamp;
}
