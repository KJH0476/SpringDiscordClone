package KoreatechJinJunGun.Win_SpringProject.files;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatFileRepository extends MongoRepository<ChatFile, String> {
    List<ChatFile> findByChatRoomIdOrderByUploadTimeAsc(String chatRoomId);
}

