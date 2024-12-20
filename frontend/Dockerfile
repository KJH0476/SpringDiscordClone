FROM node:22-alpine

#작업 디렉토리 설정
WORKDIR /app

#package.json, package-lock.json 복사
COPY package*.json ./

#npm 설치
RUN npm install

#소스코드 복사
COPY . .

#빌드
RUN npm run build

#3000포트 오픈
EXPOSE 3000

#실행
ENTRYPOINT ["npm", "start"]