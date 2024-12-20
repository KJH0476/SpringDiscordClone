package KoreatechJinJunGun.Win_SpringProject.security.logout;

import KoreatechJinJunGun.Win_SpringProject.member.service.login.JwtTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class MyLogoutSuccessHandler implements LogoutSuccessHandler {

    @Autowired
    private JwtTokenService jwtTokenService;

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        try {
            String token = request.getHeader("Authorization").substring(7);

            if (!token.isEmpty()) jwtTokenService.invalidateToken(token);
        } catch (NullPointerException e){
            log.info("리프레시 토큰 만료 -> 로그 아웃");
        }

        //로그 아웃 성공
        log.info("logout success");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write("logout success");
    }
}
