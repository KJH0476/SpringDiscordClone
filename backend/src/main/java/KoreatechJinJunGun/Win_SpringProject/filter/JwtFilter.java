package KoreatechJinJunGun.Win_SpringProject.filter;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Role;
import KoreatechJinJunGun.Win_SpringProject.member.entity.token.RefreshToken;
import KoreatechJinJunGun.Win_SpringProject.member.entity.token.TokenDto;
import KoreatechJinJunGun.Win_SpringProject.security.loginexception.MyExpiredJwtException;
import KoreatechJinJunGun.Win_SpringProject.member.service.login.JwtTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@AllArgsConstructor
public class JwtFilter extends GenericFilterBean {

    private final JwtTokenService jwtTokenService;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;
        //요청 헤더의 토큰 값을 가져온다.
        String jwt = getRequestAuthToken(httpServletRequest);

        /**
         * 요청헤더의 토큰이 존재하고, 토큰의 유효성이 검증되면 권한 정보를 SpringContextHolder에 저장한다.
         * 모든 요청에 대해 JWT 토큰을 분석하고 인증 상태를 설정하는 역할, 주로 API 요청에서 사용자의 인증 상태를 관리하는 데 사용 (LoginService에서 인증 정보 저장하는 것과 다른 역할)
         * RESTful API와 같은 Stateless 환경에서는 각 요청이 독립적으로 처리되어야 하므로, 모든 요청에서 인증 정보를 검증하고 SecurityContext에 저장해야 함
         */
        try {
            if (StringUtils.hasText(jwt) && jwtTokenService.validateToken(jwt)) {
                Authentication authentication = jwtTokenService.getAuthentication(jwt);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Email={}' 인증 정보 저장, uri={}", authentication.getName(), httpServletRequest.getRequestURI());
            }
            filterChain.doFilter(servletRequest, servletResponse);
        } catch (MyExpiredJwtException e) {
            //액세스 토큰 만료 시 아래 메서드 실행 (로그인 갱신 시도)
            handleExpiredAccessToken(httpServletRequest, httpServletResponse, jwt);
        }
    }

    /**
     * 액세스 토큰 만료 시 바로 리프레시 토큰을 검증한 후 유효할 경우 액세스 토큰와 리프레시 토큰을 다시 발급해준다.
     * 만약 리프레시 토큰 또한 만료되어 db에 존재하지 않을 경우 클라이언트가 다시 로그인 해야 한다는 응답을 준다. (로그아웃 처리)
     */
    private void handleExpiredAccessToken(HttpServletRequest request, HttpServletResponse response, String jwt) throws IOException {
        String email = jwtTokenService.getAuthentication(jwt).getName();
        RefreshToken refreshToken = jwtTokenService.getRefreshToken(email);

        if(refreshToken!=null){
            if (StringUtils.hasText(refreshToken.getRefreshToken()) && jwtTokenService.validateToken(refreshToken.getRefreshToken())) {
                //기존 리프레시 토큰 삭제
                jwtTokenService.invalidateToken(email);

                //새로운 액세스 토큰, 리프레시 토큰 생성
                TokenDto token = TokenDto.builder()
                        .accessToken(jwtTokenService.createAccessToken(email, Role.USER.getKey()))
                        .refreshToken(jwtTokenService.createRefreshToken())
                        .build();

                //인증 객체 생성
                Authentication authentication = jwtTokenService.getAuthentication(token.getAccessToken());

                //인증 정보 저장
                SecurityContext context = SecurityContextHolder.getContext();
                context.setAuthentication(authentication);

                //새로운 갱신토큰 저장
                jwtTokenService.addRefreshToken(token.getRefreshToken(), email);

                //응답 바디 생성
                Map<String, String> map = new ConcurrentHashMap<>();
                map.put("message", "NEW_ACCESS_TOKEN");
                map.put("token", token.getAccessToken());
                String body = objectMapper.writeValueAsString(map);

                //로그인 갱신 성공시 액세스 토큰을 포함하여 상태 코드 401로 응답
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write(body);
            }
        } else {
            //db에 refresh 토큰 기간이 만료되어 삭제되면 null을 반환
            //리프레시 토큰 또한 만료되면 클라이언트에게 다시 로그인 요청 상태코드 401 응답
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("REFRESH_TOKEN_EXPIRED_TOO");
        }
    }

    // Request Header 에서 토큰 정보를 꺼내오기 위한 메소드
    private String getRequestAuthToken(HttpServletRequest request) {
        //요청 헤더 'Authorization' 값
        String bearerToken = request.getHeader("Authorization");

        //bearerToken 이 존재하고, Bearer 로 시작하면, 토큰 값만 반환한다.
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

}
