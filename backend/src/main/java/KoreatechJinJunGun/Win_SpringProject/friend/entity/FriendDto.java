package KoreatechJinJunGun.Win_SpringProject.friend.entity;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Status;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FriendDto {

    private Long id; //친구 관계의 ID
    private String memberUsername; //현재 회원의 ID
    private Long friendMemberId; //친구 회원의 ID
    private String friendName; //친구의 이름
    private String friendEmail; //친구의 이메일
    private Status friendStatus; //친구의 접속여부
    private FriendRelation relation; //친구 관계
    private Date applyTime;
}
