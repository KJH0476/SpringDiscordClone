package KoreatechJinJunGun.Win_SpringProject.chat.entity.chatmessage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "chatMessage")
public class ChatMessage {
    @Id
    private String id;
    private String roomId;
    private String senderEmail;
    private String senderName;
    private String content;
    private Date timestamp;
}
