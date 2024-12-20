package KoreatechJinJunGun.Win_SpringProject.member.service.login;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import KoreatechJinJunGun.Win_SpringProject.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("loadUserByUsername 실행");

        return memberRepository.findByEmail(email)
                .map(member -> createMember(email, member))
                .orElseThrow(() -> new UsernameNotFoundException(email + " -> 회원이 존재하지 않습니다."));
    }

    public UserDetails createMember(String email, Member member){
        return User.builder()
                .username(email)
                .password(member.getPassword())
                .roles(member.getRole().toString())
                .build();
    }
}
