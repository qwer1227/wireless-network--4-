# 무선네트워크 4조
💪 운동 도우미 시스템

<br>

## 🎯 목적
- 카메라와 인공지능 기술을 결합하여 사용자의 운동을 장려하는 시스템을 개발하고자 합니다.

<br>

## 👥 조원
- 조장
  - 정성민 (qwer1227) - DB연동, 데이터베이스 값 저장 및 추출
    
- 조원
  
  - 박상원 (qarksangwon) - DB,동작 관련 기능 구현
  - 반진성 (banjinseong) - 레이즈 동작 및 기능 구현
  - 김상헌 (inhaexpress) - 스퀏 동작 및 기능 구현
  - 오주헌 (dhwngjs01)  - 서버 구축, 기능 구현
  - 신수민 (StarlightSSM) - UI 및 메인페이지 

<br>

## 🔧주요 기능
#### 운동 목표치 및 달성도 설정
- 운동동작(푸쉬업, 스쿼트, 레이즈, 런지) 선택
- 목표 횟수와 시간 선택

#### 플레이 화면
- 운동 모습을 볼 수 있는 화면구성 (카메라와 너무 가깝거나 멀리 가지 않게)
- 목표 횟수와 현재 횟수, 시간을 볼 수 있게 구성

#### 점수 등록
- ~~2분을 기준으로 각 운동 횟수가 많은 순으로 10위까지 이름등록~~
- 30초 ~ 5분 사이의 제한 시간을 입력 후 종료되면 점수 등록

<br>

## 💻 개발 환경
- 프론트엔드(HTTPS Server)
  - JavaScript
  - node-static 0.7.11

- 백엔드(Python WebSocket Secure Server)
  - Python 3.11.3
  - websockets 12.0
  - mediapipe 0.10.8
  - opencv-python 4.8.1.78

- 데이터베이스 (Firebase)
  - Realtime Database

<br>

<details>
  <summary>서버 실행 방법 (접기/펼치기)</summary>

  ## ⚙ 서버 실행 방법
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
</details>
 
<br>

## ✔ UI 아이콘 설정
## 메인 화면
- 운동 선택 버튼 4개(푸쉬업, 스쿼트, 레이즈, 런지) 각각 아이콘으로 표시
- 4개의 버튼 각각 옆에 점수 버튼을 표시

<br>

<div align="center">

  |                          푸쉬업                           |                          스쿼트                           |                             레이즈                              |                          런지                           |
  | :-------------------------------------------------------: | :-------------------------------------------------------: | :-----------------------------------------------------------: | :-----------------------------------------------------: |
  | <img width="150" height="150" src="./아이콘/푸쉬업.jpg"/> | <img width="150" height="150" src="./아이콘/스쿼트.jpg"/> | <img width="150" height="150" src="./아이콘/레이즈.jpg"/> | <img width="150" height="150" src="./아이콘/런지.jpg"/> |

</div>

<br>

<div align="center">

  |                          점수 버튼                           |
  | :----------------------------------------------------------: |
  | <img width="150" height="150" src="./아이콘/점수아이콘.jpg"> |

</div>

## 🖥️ 전체 UI 화면
<div align="center">
  <img width="500" src="./ui/전체흐름.PNG"/>
</div>

<br>

## 📝 데이터베이스
## 파이어베이스 SDK모듈 가져오기
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/113608501/77445cdb-253f-4004-8090-b7531bfed861" />
    <br>
    <br>
    <p>Firebase 모듈에서 initializeApp 함수를 가져와 Firebase 앱을 초기화하고, 데이터베이스 조작을 위해 필요한 함수들을 가져옵니다.</p>
  </div>

<br>

## 파이어베이스 설정
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/113608501/6603cf5a-bc7b-491f-9800-b24a07f8eb8b" />
    <br>
    <br>
    <p>
      Firebase 앱을 초기화할 때 필요한 설정 정보를 담은 객체입니다. <br>
      이 정보는 Firebase 프로젝트 설정에서 얻을 수 있으며 API 키, 프로젝트 ID, 데이터베이스 URL 등이 포함되어 있습니다.
    </p>
  </div>

<br>

## 파이어베이스 초기화 및 데이터 추가
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/113608501/1e337955-d243-487f-a1f3-f47963cbc5c4" />
    <br>
    <br>
    <p>Firebase 앱을 초기화하고 앱 객체를 생성하며 push 함수를 사용하여 데이터를 추가합니다.</p>
  </div>

<br>

## 파이어베이스 저장 결과
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/113608501/cfd617d6-40d4-4d46-8af9-2e83623e8e8d" />
    <br>
    <br>
    <p>push 함수를 통해 realtime데이터베이스에 값이 정상적으로 들어갔음을 보여주는 이미지입니다.</p>
  </div>

<hr>

## 11-21 ~ 11-27
<details>
  <summary>접기/펼치기</summary>
  
  ## 메인 화면
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/38345593/331e8811-104a-40bb-b373-6fa2e7123cea"/>
  </div>
  
  <br>
  
  ## 목표 선택 화면
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/38345593/63b28809-e4c2-4f5c-8a89-cc6ea2451f11"/>
  </div>
  
  <br>
  
  ## 운동 화면
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/38345593/276ac336-ca75-4eb0-abc0-41189e9b55f6"/>
  </div>
  
  <br>
  
  ## 운동 화면 예시
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/38345593/8009286f-28e0-467e-a677-2ce7ab8a77ec"/>
  </div>
  
  <br>
  
  ## 운동 종료 후 데이터베이스 저장
  <div align="center">
    <img src="https://github.com/qwer1227/wireless-network--4-/assets/38345593/9ab2e070-9b08-4d0c-9e45-0a00a4a80666"/>
  </div>
</details>

<br>

## 📡 서버 구현
<div align="center">
  <img src="https://github.com/qwer1227/wireless-network--4-/assets/38345593/72ba9a33-9e6a-4c76-a455-eaae07c6ba1e"/>
</div>

1. 클라이언트가 운동 도우미 시스템의 웹 서버에게 운동 도우미 시스템의 웹 페이지를 요청합니다.
2. 웹 페이지의 자바스크립트 코드가 실행되면서 카메라를 통해 촬영된 '영상의 프레임(이미지)'을 BASE64로 인코딩하여 웹 소켓 서버에게 전송합니다.
3. 웹 소켓 서버가 클라이언트로부터 받은 'BASE64로 인코딩 된' 영상의 프레임(이미지)을 OpenCV로 디코딩하여 이미지 파일로 변환합니다.
4. 이미지 파일을 'MediaPipe 포즈 랜드마크 모델'에 입력하여 운동 자세인지 아닌지 판단합니다.</li>
5. 운동을 수행한 자세라면 운동 점수를 1점을 올립니다.
6. 운동 점수를 클라이언트에게 웹소켓을 통해 전송합니다.
7. 운동 타이머가 종료되면 최종 운동 점수를 파이어베이스에 저장합니다.

<br>

## 🖥️ 최종 실행 화면
<div align="center">
  <h3>운동 선택 후 목표 횟수, 시간, 점수 등록할 이름 설정</h3>
  <img src="https://github.com/qwer1227/wireless-network--4-/assets/88262512/7dc41f5c-d5d4-4a06-b4df-6a635a7568d5"/>
</div>

<br>

## 순위 보기
### 데이터 없는 경우
<div align="center">
  <img src="https://github.com/qwer1227/wireless-network--4-/assets/113305463/0dd2f490-9cfb-4ab0-a4ad-06e70ca350ba"/>
</div>

<br>

### 데이터 있는 경우
<div align="center">
  <img src="https://github.com/qwer1227/wireless-network--4-/assets/113305463/b53acf82-6d9b-4027-8fb1-bf45bb5e6f5f"/>
</div>

<br>

### 결과 페이지
<div align="center">
  <img src="https://github.com/qwer1227/wireless-network--4-/assets/113305463/7a619102-adff-4f54-94ab-8061e64f7703"/>
</div>

<br>

### 운동 실행 화면
<div align="center">
  <img src="https://github.com/qwer1227/wireless-network--4-/assets/88262512/9ea35c2c-b65d-43f8-bf5f-82d1552febaf"/>
</div>

<br>

## 종료 조건 완료후
### 종료 조건: 목표시간 도달 -> 종료 뒤 자신의 기록 저장 후 순위 출력 
<div align="center">
  <img src="https://github.com/qwer1227/wireless-network--4-/assets/88262512/ac90feaf-316d-49a4-b50f-964cd3cf56f7"/>
</div>
