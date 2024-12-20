package KoreatechJinJunGun.Win_SpringProject.member.service;

import KoreatechJinJunGun.Win_SpringProject.member.entity.*;
import KoreatechJinJunGun.Win_SpringProject.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public Member signupMember(SignUpForm signUpForm){
        LocalDateTime createTime = LocalDateTime.now();

        //새로운 회원 생성 후 저장
        Member member = Member.builder()
                .email(signUpForm.getEmail())
                .password(passwordEncoder.encode(signUpForm.getPassword()))
                .username(signUpForm.getUsername())
                .nickname((signUpForm.getNickname().isEmpty()) ? signUpForm.getUsername() : signUpForm.getNickname())
                .createdate(Timestamp.valueOf(createTime))
                .birth(signUpForm.getBirth())
                .role(Role.USER)
                .status(Status.OFFLINE)
                .build();
        return memberRepository.save(member);
    }

    public Boolean checkValue(String check){
        //체크할 값이 이메일일 경우
        if(check.contains("@")){
            //같은 이메일이 존재하지 않을 경우 true 리턴, 존재 할 경우 false 리턴
            return memberRepository.findByEmail(check).isEmpty();
        }
        //체크할 값이 사용자 명일 경우
        //같은 사용자 명이 존재하지 않으면 true 리턴, 존재할 경우 false 리턴
        return memberRepository.findByUsername(check).isEmpty();
    }

    //로그인 사용자 정보 반환
    public MemberDto findLoginMember(String email){
        return memberRepository.findByEmail(email)
                .map(this::createMemberDto) //MemberDto 로 만들어 반환
                .orElseThrow(()->new RuntimeException("사용자가 존재하지 않음"));
    }

    //온라인 오프라인 업데이트
    public void updateOnlineOffline(Long memberId, Status status){
        memberRepository.updateStatusByEmail(status, memberId);
    }

    private MemberDto createMemberDto(Member member){
        return MemberDto.builder()
                .id(member.getId())
                .email(member.getEmail())
                .username(member.getUsername())
                .nickname(member.getNickname())
                .birth(member.getBirth())
                .createdate(member.getCreatedate())
                .status(member.getStatus())
                .build();
    }
}
