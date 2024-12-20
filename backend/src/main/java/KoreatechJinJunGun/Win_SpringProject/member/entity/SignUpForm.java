package KoreatechJinJunGun.Win_SpringProject.member.entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class SignUpForm {

    @NotBlank
    @Email
    String email;
    String nickname;
    @NotBlank
    String username;
    @NotBlank
    String password;
    @NotBlank
    String birth;
}
