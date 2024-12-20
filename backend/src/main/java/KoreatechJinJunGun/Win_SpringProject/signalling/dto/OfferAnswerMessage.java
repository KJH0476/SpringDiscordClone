package KoreatechJinJunGun.Win_SpringProject.signalling.dto;

import lombok.Data;

@Data
public class OfferAnswerMessage {
    private String key;
    private OfferAnswerBody body;
}
