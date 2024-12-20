package KoreatechJinJunGun.Win_SpringProject.chat.repository;

import KoreatechJinJunGun.Win_SpringProject.chat.entity.chatRoom.ChatRoomInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomInfoRepository extends JpaRepository<ChatRoomInfo, Long> {

    Optional<ChatRoomInfo> findByRoomId(String roomId);
}
