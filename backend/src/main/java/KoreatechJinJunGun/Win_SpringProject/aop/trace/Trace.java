package KoreatechJinJunGun.Win_SpringProject.aop.trace;

public interface Trace {

    TraceState begin(String message);
    void end(TraceState status);
    void exception(TraceState status, Exception e);
}
