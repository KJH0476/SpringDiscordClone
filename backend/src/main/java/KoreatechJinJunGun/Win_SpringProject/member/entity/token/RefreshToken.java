package KoreatechJinJunGun.Win_SpringProject.member.entity.token;

import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

@Getter
@RedisHash(value = "token", timeToLive = 2592000)
@NoArgsConstructor
public class RefreshToken {

    @Id
    Long id;
    String refreshToken;

    //이메일 값으로 리프레시 토큰 조회
    @Indexed
    String email;

    @Builder
    public RefreshToken(String refreshToken, String email) {
        this.refreshToken = refreshToken;
        this.email = email;
    }
}
