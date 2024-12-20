package KoreatechJinJunGun.Win_SpringProject.security.loginexception;

import org.springframework.security.core.AuthenticationException;

public class MyExpiredJwtException extends AuthenticationException {

    private final String message;
    private final Throwable cause;

    public MyExpiredJwtException(String message, Throwable cause) {
        super(message, cause);
        this.message = message;
        this.cause = cause;
    }

    @Override
    public String getMessage() {
        return super.getMessage();
    }

    @Override
    public synchronized Throwable getCause() {
        return super.getCause();
    }
}
