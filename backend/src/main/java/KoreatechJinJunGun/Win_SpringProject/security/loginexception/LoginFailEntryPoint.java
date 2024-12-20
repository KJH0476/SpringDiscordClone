package KoreatechJinJunGun.Win_SpringProject.security.loginexception;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoginFailEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        //아이디, 비번 틀렸을 떄와 토큰이 유효하지 않을때 401 반환
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);    //401 에러
        response.addHeader("Error-Message", "UNAUTHORIZED");
        response.getWriter().write("UNAUTHORIZED USER");
    }
}
