package KoreatechJinJunGun.Win_SpringProject.security.loginexception;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class MyAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        //권한이 없는 경우 403 반환(ex: USER 권한 가진 사용자가 ADMIN 에게만 허용된 자원에 접근할때 발생)
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);   //403 에러 반환
        response.getWriter().write("You do not have permission.");
    }
}
