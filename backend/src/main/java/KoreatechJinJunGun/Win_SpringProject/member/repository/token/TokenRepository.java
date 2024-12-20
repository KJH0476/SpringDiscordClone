package KoreatechJinJunGun.Win_SpringProject.member.repository.token;

import KoreatechJinJunGun.Win_SpringProject.member.entity.token.RefreshToken;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface TokenRepository extends CrudRepository<RefreshToken, String> {
    Optional<RefreshToken> findByEmail(String email);
}
