package KoreatechJinJunGun.Win_SpringProject.member;

import KoreatechJinJunGun.Win_SpringProject.member.repository.MemberRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Map;

@SpringBootTest
@AutoConfigureMockMvc
public class DuplicatedTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    MemberRepository memberRepository;
    ObjectMapper objectMapper = new ObjectMapper();

    @Value("${TEST_DUP_EMAIL}") String email;
    @Value("${TEST_DUP_USERNAME}") String username;

    @Test
    @DisplayName("회원가입 이메일 or 사용자명 중복 경우 테스트")
    void 이메일_사용자명_중복O() throws Exception{
        //given
        String check1 = email;
        String check2 = username;

        //when
        //이메일 중복 O
        mvc.perform(MockMvcRequestBuilders.get("/signup/check")
                        .param("check", check1))
                //then
                .andExpect(MockMvcResultMatchers.status().isConflict())   //http 상태 409
                //응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("message", "사용할 수 없습니다."))));
        //when
        //사용자명 중복 O
        mvc.perform(MockMvcRequestBuilders.get("/signup/check")
                        .param("check", check2))
                //then
                .andExpect(MockMvcResultMatchers.status().isConflict())   //http 상태 409
                //응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("message", "사용할 수 없습니다."))));
    }

    @Test
    @DisplayName("회원가입 이메일 or 사용자명 중복 X 경우 테스트")
    void 이메일_사용자명_중복X() throws Exception{
        //given
        String check1 = "XX"+email;
        String check2 = "XX"+username;

        //when
        //이메일 중복 X
        mvc.perform(MockMvcRequestBuilders.get("/signup/check")
                        .param("check", check1))
                //then
                .andExpect(MockMvcResultMatchers.status().isOk())   //http 상태 200
                //응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("message", "사용할 수 있습니다."))));
        //when
        //사용자명 중복 X
        mvc.perform(MockMvcRequestBuilders.get("/signup/check")
                        .param("check", check2))
                //then
                .andExpect(MockMvcResultMatchers.status().isOk())   //http 상태 200
                //응답 바디 메시지 확인
                .andExpect(MockMvcResultMatchers.content().json(objectMapper.writeValueAsString(Map.of("message", "사용할 수 있습니다."))));
    }
}
