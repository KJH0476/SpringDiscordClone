package KoreatechJinJunGun.Win_SpringProject.aop.trace;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TraceOfLog implements Trace{
    private static final String START_PREFIX = "-->";
    private static final String COMPLETE_PREFIX = "<--";
    private static final String EX_PREFIX = "<X-";

    private final ThreadLocal<TraceId> threadLocal = new ThreadLocal<>();

    @Override
    public TraceState begin(String message) {
        syncTraceId();
        TraceId traceId = threadLocal.get();
        Long startTimeMs = System.currentTimeMillis();
        log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX, traceId.getLevel()), message);
        return new TraceState(traceId, startTimeMs, message);
    }

    @Override
    public void end(TraceState status) {
        complete(status, null);
    }

    @Override
    public void exception(TraceState status, Exception e) {
        complete(status, e);
    }

    private void complete(TraceState status, Exception e) {
        Long stopTimeMs = System.currentTimeMillis();
        long resultTimeMs = stopTimeMs - status.getStartTimeMs();
        TraceId traceId = status.getTraceId();
        if (e == null) {
            log.info("[{}] {}{} time={}ms", traceId.getId(),
                    addSpace(COMPLETE_PREFIX, traceId.getLevel()), status.getMessage(), resultTimeMs);
        } else {
            log.info("[{}] {}{} time={}ms ex={}", traceId.getId(),
                    addSpace(EX_PREFIX, traceId.getLevel()), status.getMessage(), resultTimeMs, e.toString());
        }
        releaseTraceId();
    }

    private void syncTraceId() {
        TraceId traceId = threadLocal.get();
        if (traceId == null) threadLocal.set(new TraceId());
        else threadLocal.set(traceId.createNextId());
    }

    private void releaseTraceId() {
        TraceId traceId = threadLocal.get();
        if (traceId.isFirstLevel()) threadLocal.remove();
        else threadLocal.set(traceId.createPreviousId());
    }

    private static String addSpace(String prefix, int level) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < level; i++) sb.append( (i == level - 1) ? "|" + prefix : "|   ");

        return sb.toString();
    }
}
