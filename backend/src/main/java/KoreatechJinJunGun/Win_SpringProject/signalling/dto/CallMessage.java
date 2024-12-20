package KoreatechJinJunGun.Win_SpringProject.signalling.dto;

import lombok.Data;

@Data
public class CallMessage {
    private String email;
    private String roomId;
    private String message;
}
