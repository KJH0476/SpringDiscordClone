package KoreatechJinJunGun.Win_SpringProject.aop.trace;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class TraceAop {

    private final Trace trace;

    @Around("execution(* KoreatechJinJunGun.Win_SpringProject..*(..)) && !execution(* KoreatechJinJunGun.Win_SpringProject.aop..*(..))")
    public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
        TraceState state = null;
        try {
            String message = joinPoint.getSignature().toShortString();
            state = trace.begin(message);

            Object result = joinPoint.proceed();
            trace.end(state);
            return result;
        } catch (Exception e) {
            trace.exception(state, e);
            throw e;
        }
    }
}
