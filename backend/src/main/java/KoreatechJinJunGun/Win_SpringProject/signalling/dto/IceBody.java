package KoreatechJinJunGun.Win_SpringProject.signalling.dto;

import lombok.Data;

@Data
public class IceBody {
    private String candidate;
    private String sdpMid;
    private int sdpMLineIndex;
    private String usernameFragment;
}
