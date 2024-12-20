package KoreatechJinJunGun.Win_SpringProject.friend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendForm {

    private String memberName;
    private String friendName;
}
