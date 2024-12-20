package KoreatechJinJunGun.Win_SpringProject.member.entity;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LoginForm {

    @NotBlank(message = "이메일을 입력해주세요.")
    String email;
    @NotBlank(message = "비밀번호를 입력해주세요.")
    String password;
}
