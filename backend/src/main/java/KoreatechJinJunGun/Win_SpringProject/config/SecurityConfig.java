package KoreatechJinJunGun.Win_SpringProject.config;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Role;
import KoreatechJinJunGun.Win_SpringProject.security.loginexception.LoginFailEntryPoint;
import KoreatechJinJunGun.Win_SpringProject.security.loginexception.MyAccessDeniedHandler;
import KoreatechJinJunGun.Win_SpringProject.filter.JwtFilter;
import KoreatechJinJunGun.Win_SpringProject.security.logout.MyLogoutSuccessHandler;
import KoreatechJinJunGun.Win_SpringProject.member.service.login.JwtTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenService jwtTokenService;
    private final LoginFailEntryPoint loginFailEntryPoint;
    private final MyAccessDeniedHandler myAccessDeniedHandler;
    private final MyLogoutSuccessHandler myLogoutSuccessHandler;

    // PasswordEncoder는 BCryptPasswordEncoder를 사용
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())   //CSRF 보호 기능을 비활성화 -> CSRF는 웹 애플리케이션에서 사용자가 의도하지 않은 명령을 실행하는 것을 방지하는 보안 기능
                .headers(headers -> headers.    //X-Frame-Options를 비활성화 -> 클릭재킹 공격을 방지하는 보안 기능
                        frameOptions(frameOptions -> frameOptions.disable()))
                //세션 사용 X
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                //예외처리 등록
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(loginFailEntryPoint)
                                .accessDeniedHandler(myAccessDeniedHandler)
                )
                .authorizeHttpRequests(authorize -> {
                    authorize
                            //모두에게 허용
                            .requestMatchers("/", "/signup", "/signup/**", "/login", "/logout", "/css/**", "/*.ico", "/error", "/img/**", "/js/**", "/static/**", "/templates/**", "/ws/**", "/messages/**", "/user/**", "/app/**").permitAll()
                            //관리자 ADMIN 에게만 허용
                            .requestMatchers("/admin/**").hasRole(Role.ADMIN.name())
                            //로그인한 일반 사용자 USER, 관리자 ADMIN 모두 허용
                            .requestMatchers("/api/**", "/app/**").hasAnyRole(Role.ADMIN.name(), Role.USER.name())
                            .anyRequest().authenticated();  //로그인 사용자 모든 경로 접근 가능
                })
                .logout(logout -> logout    //로그아웃 설정
                        .logoutSuccessHandler(myLogoutSuccessHandler)
                        //로그아웃 시 저장된 인증정보 삭제
                        .addLogoutHandler(new SecurityContextLogoutHandler())
                        .clearAuthentication(true)
                )
                //JWT 토큰의 유효성을 먼저 검증
                .addFilterBefore(new JwtFilter(jwtTokenService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
