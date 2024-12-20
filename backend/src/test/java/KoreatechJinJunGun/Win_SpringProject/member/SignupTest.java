package KoreatechJinJunGun.Win_SpringProject.member;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import KoreatechJinJunGun.Win_SpringProject.member.repository.MemberRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.HashMap;
import java.util.Map;

@SpringBootTest
@AutoConfigureMockMvc
public class SignupTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    MemberRepository memberRepository;
    ObjectMapper objectMapper = new ObjectMapper();

    @Value("${TEST_SIGNUP_EMAIL}") String email;
    @Value("${TEST_SIGNUP_PASSWORD}") String password;
    @Value("${TEST_SIGNUP_USERNAME}") String username;
    @Value("${TEST_SIGNUP_NICKNAME}") String nickname;
    @Value("${TEST_SIGNUP_BIRTH}") String birth;

    @Test
    @DisplayName("회원가입 성공 테스트 - nickname 입력")
    void 회원가입_성공_별명입력O() throws Exception{
        //given
        Map<String, String> map = new HashMap<>();
        map.put("email", email);
        map.put("nickname", nickname);
        map.put("username", username);
        map.put("password", password);
        map.put("birth", birth);

        //when
        mvc.perform(MockMvcRequestBuilders.post("/signup")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(map)))
                //then
                .andExpect(MockMvcResultMatchers.status().isOk())   //http 상태 200
                //성공 응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("message", "Success Signup"))));
    }

    @Test
    @DisplayName("회원가입 성공 테스트 - nickname 입력 X")
    void 회원가입_성공_별명입력X() throws Exception{
        //given
        Map<String, String> map = new HashMap<>();
        map.put("email", email);
        map.put("nickname", "");
        map.put("username", username);
        map.put("password", password);
        map.put("birth", birth);

        //when
        mvc.perform(MockMvcRequestBuilders.post("/signup")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(map)))
                //then
                .andExpect(MockMvcResultMatchers.status().isOk())   //http 상태 200
                //성공 응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("message", "Success Signup"))));

        //별명 공백일 경우 별명==사용자명
        Member member = memberRepository.findByEmail(email).get();
        Assertions.assertThat(member.getNickname()).isEqualTo(member.getUsername());
    }

    @Test
    @DisplayName("회원가입 이메일 형식 맞지 않을 경우 테스트")
    void 회원가입_이메일형식X() throws Exception{
        //given
        Map<String, String> map = new HashMap<>();
        map.put("email", "abccdefg");
        map.put("nickname", nickname);
        map.put("username", username);
        map.put("password", password);
        map.put("birth", birth);

        //when
        mvc.perform(MockMvcRequestBuilders.post("/signup")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(map)))
                //then
                .andExpect(MockMvcResultMatchers.status().isBadRequest())   //http 상태 400
                //응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("email", "must be a well-formed email address"))));
    }

    @Test
    @DisplayName("회원가입 각 필드(사용자명, 비밀번호) 공백일 경우 테스트")
    void 회원가입_공백() throws Exception{
        //given
        Map<String, String> map = new HashMap<>();
        map.put("email", email);
        map.put("nickname", nickname);
        map.put("username", null);  //@NotBlank 이기 때문에 null, "" 모두 처리
        map.put("password", "");
        map.put("birth", birth);

        //when
        mvc.perform(MockMvcRequestBuilders.post("/signup")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(map)))
                //then
                .andExpect(MockMvcResultMatchers.status().isBadRequest())   //http 상태 400
                //응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("password","must not be blank","username","must not be blank"))));
    }

    //각 테스트 수행한 후 실행
    //회원가입_성공 테스트 성공 시 db에 정보 저장되므로 테스트 수행 후 삭제 처리
    @AfterEach
    void afterexecute(){
        memberRepository.findByEmail(email)
                .ifPresent(member -> memberRepository.delete(member));
    }
}
