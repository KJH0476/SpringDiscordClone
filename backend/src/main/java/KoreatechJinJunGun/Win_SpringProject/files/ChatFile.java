package KoreatechJinJunGun.Win_SpringProject.files;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "custom_files.files")
@AllArgsConstructor
@Getter
public class ChatFile {

    @Id
    private String id;
    private String chatRoomId;
    private String fileName;
    private LocalDateTime uploadTime;

    // 생성자, getter, setter 생략
}

