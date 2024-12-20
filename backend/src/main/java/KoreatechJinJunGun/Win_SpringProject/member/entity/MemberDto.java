package KoreatechJinJunGun.Win_SpringProject.member.entity;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDto {

    private Long id;
    private String email;
    private String username;
    private String nickname;
    private Date createdate;
    private String birth;
    private Status status;
}
