package KoreatechJinJunGun.Win_SpringProject.member.controller;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import KoreatechJinJunGun.Win_SpringProject.member.entity.MemberDto;
import KoreatechJinJunGun.Win_SpringProject.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/main/{email}")
    public ResponseEntity<MemberDto> mainPage(@PathVariable("email") String email) {
        MemberDto loginMember = memberService.findLoginMember(email);
        return new ResponseEntity<>(loginMember, HttpStatus.OK);
    }
}
