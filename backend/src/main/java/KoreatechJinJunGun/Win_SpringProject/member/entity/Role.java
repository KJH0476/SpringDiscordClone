package KoreatechJinJunGun.Win_SpringProject.member.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 구글 로그인 사용자 권한
 */
@Getter
@RequiredArgsConstructor
public enum Role {

    ADMIN("ROLE_ADMIN", "ADMIN"),
    USER("ROLE_USER", "USER");

    private final String key;
    private final String title;
}
