package KoreatechJinJunGun.Win_SpringProject.signalling.dto;

import lombok.Data;

@Data
public class IceMessage {
    private String key;
    private IceBody body;
}
