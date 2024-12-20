package KoreatechJinJunGun.Win_SpringProject.aop.trace;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TraceState {

    private TraceId traceId;
    private Long startTimeMs;
    private String message;
}
