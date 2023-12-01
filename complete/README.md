## 프론트엔드 서버 실행방법 (HTTP, HTTPS)

- 환경이 매번 다를 수 있으므로 백엔드 서버의 주소를 수정해야함.
```javascript
/* frontend/js/main.js */

// 백엔드 서버의 주소와 일치해야함
const url = "wss://dhwngjs01.ddns.net:3000"; // WebSocket 서버 주소
```


- 패키지 설치
```
npm install

npm install -g nodemon

nodemon www
```


## 백엔드 서버 실행방법 (WebSocket Secure, MediaPipe)
기본 IP : 자동으로 설정 ```socket.gethostbyname(socket.gethostname())``` 사용했음  
기본 PORT : 3000
```
npm install -g nodemon

nodemon server.py
```

- 백엔드 서버는 패키지 수동 설치가 필요할 수 있음.

