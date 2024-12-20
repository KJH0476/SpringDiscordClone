package KoreatechJinJunGun.Win_SpringProject.member.service.login;

import KoreatechJinJunGun.Win_SpringProject.member.entity.token.RefreshToken;
import KoreatechJinJunGun.Win_SpringProject.member.repository.token.TokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RefreshTokenService {

    private final TokenRepository tokenRepository;

    //갱신 토큰 조회
    public RefreshToken searchRefreshToken(String email) {
        return tokenRepository.findByEmail(email)
                .orElseThrow(IllegalArgumentException::new);
    }

    //갱신 토큰 저장
    public void saveRefreshToken(RefreshToken token){
        tokenRepository.save(RefreshToken.builder()
                .refreshToken(token.getRefreshToken())
                .email(token.getEmail()).build());
    }

    //갱신토큰 삭제
    public void removeRefreshToken(String email){
        tokenRepository.findByEmail(email).ifPresent(tokenRepository::delete);
    }
}
