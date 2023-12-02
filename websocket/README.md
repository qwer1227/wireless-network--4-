## 구동 환경

- Python 3.11.3
  - websockets 12.0
  - mediapipe 0.10.8
  - opencv-python 4.8.1.78
- Node.js 19.8.1
  - node-static 0.7.11

## nodemon 설치를 권장합니다.

- nodemon은 서버 코드를 수정할 때마다 서버를 재시작해주는 패키지입니다.
- 서버 코드를 수정할 때마다 서버를 재시작해야하는 번거로움을 줄여줍니다.
- -g 옵션을 통해 전역으로 설치해주시면 됩니다.

```
npm install -g nodemon
```

## 프론트엔드 서버 실행방법 (NodeJS, HTTP, HTTPS)

- 서버 환경이 다를 수 있으므로 웹소켓 주소를 수정해야함.

```javascript
/* frontend/js/main.js */

// 백엔드 서버의 주소와 일치해야함
const url = "wss://dhwngjs01.ddns.net:3000"; // WebSocket 서버 주소
```

- 패키지 설치

```
npm install

nodemon www
```

## 백엔드 서버 실행방법 (Python, WebSocket Secure, MediaPipe)

기본 IP : 자동으로 설정 `socket.gethostbyname(socket.gethostname())` 사용했음  
기본 PORT : 3000

```
nodemon server.py
```

- 백엔드 서버는 모듈 설치가 필요할 수 있음.
