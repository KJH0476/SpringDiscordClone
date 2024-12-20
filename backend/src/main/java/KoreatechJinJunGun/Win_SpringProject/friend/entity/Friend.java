package KoreatechJinJunGun.Win_SpringProject.friend.entity;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memberId", referencedColumnName = "id") // 현재 사용자
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friendMemberId", referencedColumnName = "id") // 친구 사용자
    private Member friendMember;

    @Enumerated(EnumType.STRING)
    private FriendRelation relationStatus;

    private Date applyTime;
    private Date relationDate;
}
