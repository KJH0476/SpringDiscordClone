#도커 이미지의 베이스 이미지 지정
FROM openjdk:17-jdk-slim

WORKDIR /app

#볼륨 지정
VOLUME /tmp

#애플리케이션 파일을 컨테이너 내부로 복사
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

#외부에 드러날 포트
EXPOSE 8080

#실행
ENTRYPOINT ["java","-jar","/app/app.jar"]