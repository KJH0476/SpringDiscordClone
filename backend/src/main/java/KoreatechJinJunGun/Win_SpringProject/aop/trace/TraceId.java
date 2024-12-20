package KoreatechJinJunGun.Win_SpringProject.aop.trace;

import lombok.Getter;

import java.util.UUID;

@Getter
public class TraceId {

    private String id;
    private int level;

    public TraceId() {
        this.id = createId();
        this.level = 0;
    }

    private TraceId(String id, int level) {
        this.id = id;
        this.level = level;
    }

    private String createId() {
        //uuid는 중복되지 않는 고유한 키를 생성하는 알고리즘
        //앞 8자리만 잘라서 사용
        return UUID.randomUUID().toString().substring(0 ,8);
    }

    //TraceId 를 기반으로 다음 TraceId 를 만들면 id 는 기존과 같고, level 은 하나 증가한다.
    public TraceId createNextId() {
        return new TraceId(id, level + 1);
    }

    //createNextId()와 반대로 이전 TraceId를 만든다.
    public TraceId createPreviousId() {
        return new TraceId(id, level - 1);
    }

    //첫 번째 레벨 여부를 편리하게 확인할 수 있는 메서드
    public boolean isFirstLevel() {
        return level == 0;
    }
}
