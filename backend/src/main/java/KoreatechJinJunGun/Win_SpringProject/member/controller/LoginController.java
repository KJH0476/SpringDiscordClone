package KoreatechJinJunGun.Win_SpringProject.member.controller;

import KoreatechJinJunGun.Win_SpringProject.member.entity.LoginForm;
import KoreatechJinJunGun.Win_SpringProject.member.entity.token.TokenDto;
import KoreatechJinJunGun.Win_SpringProject.member.service.login.LoginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Validated @RequestBody LoginForm form,
                                                     BindingResult bindingResult){
        //이메일, 비밀번호 입력하지 않았을 때 예외 처리
        if(bindingResult.hasErrors()){
            List<FieldError> errors = bindingResult.getFieldErrors();
            StringBuilder sb = new StringBuilder();

            for (FieldError error : errors) {
                sb.append(error.getField());
                sb.append(" ");
            }
            sb.append("입력해주세요.");

            //바디에 에러메세지 담아서 반환, 400 에러
            return new ResponseEntity<>(makeResponseBody(sb.toString(), ""), HttpStatus.BAD_REQUEST);
        }

        //로그인 성공 로직
        TokenDto token = loginService.login(form);

        //로그인 성공시 200 반환
        return new ResponseEntity<>(makeResponseBody("success login", token.getAccessToken()), HttpStatus.OK);
    }

    @GetMapping("/admin/test")
    public String test(){
        return "admin success";
    }

    @PostMapping("/user/test")
    public String test1(){
        return "user success";
    }

    //응답 바디 생성
    private static Map<String, String> makeResponseBody(String bodyMessage, String token){
        Map<String, String> body = new ConcurrentHashMap<>();
        body.put("message", bodyMessage);
        if(!token.isEmpty()) body.put("token", token);
        return body;
    }
}
