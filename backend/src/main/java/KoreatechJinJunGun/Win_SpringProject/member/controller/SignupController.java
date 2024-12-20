package KoreatechJinJunGun.Win_SpringProject.member.controller;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import KoreatechJinJunGun.Win_SpringProject.member.entity.SignUpForm;
import KoreatechJinJunGun.Win_SpringProject.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class SignupController {

    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> singUp(@Validated @RequestBody SignUpForm signUpForm,
                                         BindingResult bindingResult) {
        Map<String, String> message = new ConcurrentHashMap<>();
        //예외 처리
        if(bindingResult.hasErrors()){
            List<FieldError> errors = bindingResult.getFieldErrors();
            for (FieldError error : errors) {
                message.put(error.getField(), error.getDefaultMessage());
            }
            //400 반환
            return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
        }

        //회원가입 성공 로직
        Member member = memberService.signupMember(signUpForm);

        message.put("message", "Success Signup");
        //성공 200 반환
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    //사용자 명 겹치는지 확인
    @GetMapping("/signup/check")
    public ResponseEntity<Map<String, String>> doubleCheck(@RequestParam("check") String check){
        Map<String, String> message = new ConcurrentHashMap<>();

        //이미 사용자가 존재할 경우 409 리턴
        if(!memberService.checkValue(check)) {
            message.put("message", "사용할 수 없습니다.");
            return new ResponseEntity<>(message, HttpStatus.CONFLICT);
        }

        message.put("message", "사용할 수 있습니다.");
        //존재하지 않으면 200 리턴
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
