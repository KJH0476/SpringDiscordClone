package KoreatechJinJunGun.Win_SpringProject.member.service.login;

import KoreatechJinJunGun.Win_SpringProject.member.entity.LoginForm;
import KoreatechJinJunGun.Win_SpringProject.member.entity.token.TokenDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LoginService {

    private final JwtTokenService jwtTokenService;
    private final AuthenticationManagerBuilder authManagerBuilder;

    public TokenDto login(LoginForm form){

        log.info("loginService 실행");
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(form.getEmail(), form.getPassword());
        //CustomUserDetailService 의 loadUser() 실행됨
        Authentication authentication = authManagerBuilder.getObject().authenticate(authenticationToken);

        //사용자가 로그인한 직후의 인증 상태를 즉시 반영(JwtFilter에서 인증정보 저장하는 것과 다른 역할)
        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(authentication);

        //인증 실패시 AuthenticationException 예외가 발생하며 LoginFailEntryPoint 에서 예외가 잡힌다.(createToken 호출 X)
        //인증이 성공하면 토큰을 생성한다.
        return jwtTokenService.createToken(authentication);
    }
}
