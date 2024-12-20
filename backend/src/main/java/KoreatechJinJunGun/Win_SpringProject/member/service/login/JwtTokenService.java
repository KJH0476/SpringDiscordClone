package KoreatechJinJunGun.Win_SpringProject.member.service.login;

import KoreatechJinJunGun.Win_SpringProject.member.entity.token.RefreshToken;
import KoreatechJinJunGun.Win_SpringProject.member.entity.token.TokenDto;
import KoreatechJinJunGun.Win_SpringProject.security.loginexception.MyExpiredJwtException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtTokenService implements InitializingBean {

    @Value("${jwt-secret-key}")
    private String SECRET_KEY;
    @Value("${access-jwt-expire-time}")
    private Long accessExpireTime;
    @Value("${refresh-jwt-expire-time}")
    private Long refreshExpireTime;
    private final SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;   //서명 알고리즘
    private Key signature; //서명
    private final RefreshTokenService refreshTokenService;

    //직접 로그인 시 액세스 토큰, 리프레시 토큰 발급
    public TokenDto createToken(Authentication authentication){
        log.info("createToken 실행");
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        //액세스 토큰, 리프레시 토큰 생성
        String accessToken = createAccessToken(authentication.getName(), authorities);
        String refreshToken = createRefreshToken();

        //리프레시 토큰 저장
        addRefreshToken(refreshToken, authentication.getName());

        return TokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    //엑세스 토큰 생성
    public String createAccessToken(String email, String auth){
        return Jwts.builder()
                .setSubject(email)
                .claim("auth", auth)
                .signWith(signature, signatureAlgorithm)
                .setExpiration(new Date(System.currentTimeMillis() + accessExpireTime))
                .compact();
    }

    //리프레시 토큰 생성
    public String createRefreshToken(){

        return Jwts.builder()
                .signWith(signature, signatureAlgorithm)
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpireTime))
                .compact();
    }

    public void addRefreshToken(String refreshToken, String email){
        //리프레시 토큰 저장
        refreshTokenService.saveRefreshToken(RefreshToken.builder()
                .refreshToken(refreshToken)
                .email(email).build());
    }

    //로그아웃 or 잘못된 토큰 or 재로그인 일 시 토큰을 무효화
    public void invalidateToken(String email) {
        log.info("invalidateToken 실행");
        //매개변수로 받은 이메일을 통해 db에 저장되어 있는 갱신토큰을 삭제해 무효화
        refreshTokenService.removeRefreshToken(email);
    }

    // 토큰으로 클레임을 만들고 이를 이용해 유저 객체를 만들어서 최종적으로 authentication 객체를 리턴
    public Authentication getAuthentication(String token) {
        try {
            Claims claims = Jwts
                    .parserBuilder()
                    .setSigningKey(signature)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return makeAuthentication(claims, token);
        } catch (ExpiredJwtException e) {
            //엑세스 토큰 만료시 로그인을 다시 시도하기 위해 만료된 토큰의 클레임으로 Authentication 객체 생성
            log.info("만료된 액세스 토큰 인증 객체 반환");
            return makeAuthentication(e.getClaims(), token);
        }
    }

    //Authentication 객체를 만드는 로직
    public Authentication makeAuthentication(Claims claims, String token){
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get("auth").toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        User principal = new User(claims.getSubject(), "", authorities);

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    //db에 저장되어 있는 리프레시 토큰 반환
    public RefreshToken getRefreshToken(String email){

        //db에 리프레시 토큰 존재하면 반환, 없을 시 null 반환 (NullPointerException 발생시켜 로그인 재 요청 해주기 위함)
        try{
            return refreshTokenService.searchRefreshToken(email);
        } catch (IllegalArgumentException e) {
            log.info("리프레시 토큰 만료");
        }
        return null;
    }

    // 토큰의 유효성 검증을 수행
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(signature).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
            //토큰 만료시 예외를 던져준다.
            throw new MyExpiredJwtException("만료된 토큰", e);
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        //Base64로 인코딩된 비밀 키를 디코딩하여 바이트 배열로 저장
        byte[] keyByte = Decoders.BASE64.decode(SECRET_KEY);
        //디코딩된 비밀키와 서명 알고리즘을 넣어 Key(=서명) 생성
        //SecretKeySpec : Jwt를 서명하거나 서명을 검증하는 데 사용
        signature = new SecretKeySpec(keyByte, signatureAlgorithm.getJcaName());
    }
}
