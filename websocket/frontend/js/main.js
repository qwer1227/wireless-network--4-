const url = "wss://dhwngjs01.iptime.org:3000"; // WebSocket 서버 주소
const ws = new WebSocket(url);

// DOM 요소
const video = document.getElementById("video-input");
const canvas = document.getElementById("video-output");
const img = document.getElementById("received-image");
const exerciseTitle = document.getElementById("exercise-title");
const exerciseDescription = document.getElementById("exercise-description");

const w = 400;
const h = 300;
video.width = w;
video.height = h;
canvas.width = video.width;
canvas.height = video.height;

const ctx = canvas.getContext("2d");

var streamInterval;

// 운동 관련 변수
var score = 0; // 현재 운동 횟수

// 플래그 변수
var exerciseStartFlag = false; // 운동 시작 여부 (시작 버튼을 누르면 true)
var breakLoopFlag = false; // 루프 종료 여부 (운동 종료 시 true)
var timerStartFlag = false; // 타이머 시작 여부 (타이머가 시작되면 true)

// 프로그레스 링에서 사용할 변수
var progress = 0; // 진행도
var remainTime = 0; // 운동 종료 시간

// 파라미터로 목표 횟수와 제한 시간을 받아옴
const param = new URLSearchParams(window.location.search); // URL 파라미터
const exercise = param.get("exercise") ? param.get("exercise") : ""; // 운동 종류
const goalCount = param.get("goalCount") ? Number(param.get("goalCount")) : 20; // 목표 횟수
const goalTime = param.get("goalTime") ? Number(param.get("goalTime")) : 120; // 제한 시간

window.onload = function () {
  init();

  getUserMedia(); // 웹 캠 연결
  processImage(); // 캔버스에 웹 캠 영상 출력
  updateProgress(); // 프로그레스 링 업데이트
};

function init() {
  timerText.textContent = `제한 시간 : ${goalTime} 초`;

  switch (exercise) {
    case "pushup":
      exerciseTitle.innerHTML = "푸쉬업";
      exerciseDescription.innerHTML = "정면을 보고 팔꿈치를 굽혀 가슴이 바닥에 닿을 때까지 몸을 내린 후, 팔을 펴서 원래 자세로 돌아옵니다.";
      break;
    case "squat":
      exerciseTitle.innerHTML = "스쿼트";
      exerciseDescription.innerHTML = "다리를 어깨너비만큼 벌리고, 무릎이 발끝을 넘어가지 않도록 하며 엉덩이를 뒤로 빼고 앉습니다. 그 후, 원래 자세로 돌아옵니다.";
      break;
    case "raise":
      exerciseTitle.innerHTML = "사이드 레터럴 레이즈";
      exerciseDescription.innerHTML = "양손에 덤벨을 들고 서서, 어깨 높이까지만 옆으로 천천히 들어 올려줍니다. 그 후, 원래 자세로 돌아옵니다.";
      break;
    case "lunge":
      exerciseTitle.innerHTML = "런지";
      exerciseDescription.innerHTML = "한쪽 다리를 앞으로 내밀고, 다른쪽 다리는 뒤로 빼서 앉습니다. 그 후, 다시 원래 자세로 돌아옵니다.";
      break;
  }
}

// 서버 연결 시 실행
ws.onopen = function () {
  if (exercise == "") {
    alert("exercise 파라미터가 없습니다.");
    return;
  }

  sendDataToServer({ exercise: exercise }); // 무슨 운동을 할껀지 서버에 전송
};

// 서버에서 메시지 수신 시 실행
ws.onmessage = function (msg) {
  data = JSON.parse(msg.data);

  // 점수 갱신
  if (data.score != undefined) score = data.score;
  updateProgress(); // 프로그레스 링 업데이트 (부하 살펴봐야됨)

  // ----------------------- 나중에 지워야 됨
  // 테스트용 포즈 추적 이미지 출력
  if (exerciseStartFlag) {
    img.src = data.image;
  }
  // ----------------------- 나중에 지워야 됨

  // ----------------------- 나중에 지워야 됨
  // 클라이언트 접속 목록을 화면에 표시
  if (data.clients != undefined) {
    const clients = document.querySelector("#clients");
    clients.innerHTML = "";
    for (let i = 0; i < data.clients.length; i++) {
      const li = document.createElement("li");

      ip = data.clients[i].split("|")[0];
      port = data.clients[i].split("|")[1];
      date = data.clients[i].split("|")[2];

      li.innerHTML = `${ip}:${port} (${date})`;
      clients.appendChild(li);
    }
  }
  // ----------------------- 나중에 지워야 됨
};

// 서버로 데이터 전송
function sendDataToServer(json) {
  json = JSON.stringify(json);
  ws.send(json);
}

// 카운트 다운 시작
function start() {
  const clock = document.getElementById("clock");
  const span = document.querySelector("#clock span");

  exerciseStartFlag = false; // 카운트 다운 시작 여부 초기화

  let countdown = 3; // 카운트 다운 시작 숫자
  span.innerHTML = `${countdown} 초 후 시작`;
  clock.style.display = "block";

  updateProgress(); // 프로그레스 링 업데이트

  const timer = setInterval(() => {
    countdown--;

    if (countdown == 0) {
      span.innerHTML = "시작";
    } else if (countdown == -1) {
      clock.style.display = "none";
      exerciseStartFlag = true;
      timerText.textContent = `남은 시간 : ${goalTime} 초`;
      updateProgress(); // 프로그레스 링 업데이트
      clearInterval(timer);

      // Start 버튼을 누른 뒤, 운동 타이머가 시작되지 않았다면 카운트다운 시작
      if (exerciseStartFlag && !timerStartFlag) {
        startTimer(goalTime);
        stream(); // 서버로 이미지 전송 시작
      }
    } else {
      span.innerHTML = `${countdown} 초 후 시작`;
    }
  }, 1000);
}

function startTimer() {
  remainTime = goalTime;

  timer = setInterval(function () {
    remainTime--;

    timerText.textContent = `남은 시간 : ${remainTime} 초`;

    if (remainTime <= 0 || !exerciseStartFlag) {
      clearInterval(timer);
      breakLoopFlag = true;
    }
  }, 1000);

  timerStartFlag = true;
}

function stream() {
  // 이미지 전송 간격 설정 (60이 적당함, 라즈베리파이에서 느리게 작동하면 값 조절 해야할듯)
  streamInterval = setInterval(sendImage, 30);

  function sendImage() {
    // 목표 횟수를 달성하거나 제한 시간이 지나면 루프 종료
    if (score >= goalCount || remainTime <= 0) {
      clearInterval(streamInterval);
      clearInterval(timer);
      saveScoreToFirebase(exercise, score, goalTime); // 데이터베이스에 저장
      return;
    }

    let imgData = canvas.toDataURL("image/jpeg", 0.5); // 0.5 = 50% quality
    sendDataToServer({ imgData: imgData }); // 서버로 이미지 데이터 전송
  }
}

// 캔버스에 웹 캠 영상 출력
function processImage() {
  ctx.drawImage(video, 0, 0, w, h);
  setTimeout(processImage, 1000 / 60); // 사용자 웹 캠 프레임레이트 설정 (60fps)
}

// 웹 캠 연결
function getUserMedia() {
  const constraints = { audio: false, video: true }; // 오디오, 비디오 사용 여부
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia; // 크로스 브라우징

  navigator.getUserMedia(constraints, successCallback, errorCallback); // 웹 캠 연결

  // 웹 캠 연결 성공
  function successCallback(stream) {
    video.srcObject = stream;
    video.play();
  }

  // 웹 캠 연결 실패
  function errorCallback(error) {
    console.log(error);
    alert("웹 캠 연결에 실패했습니다.");
  }
}

// 프로그레스 링 (https://css-tricks.com/building-progress-ring-quickly/)
const circle = document.querySelector(".progress-ring__circle");
const progressText = document.querySelector("#progress");
const currentCountText = document.querySelector("#current-count");
const goalCountText = document.querySelector("#goal-count");
const timerText = document.querySelector("#alarm");

const radius = circle.r.baseVal.value; // 반지름
const circumference = 2 * Math.PI * radius; // 원의 둘레

circle.style.strokeDasharray = `${circumference} ${circumference}`; // dasharray를 원의 둘레로 설정
circle.style.strokeDashoffset = circumference; // 원의 둘레만큼 dash를 이동시켜서 안보이게 함

goalCountText.textContent = `${goalCount} 개`; // 목표 카운트를 화면에 표시

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function updateProgress() {
  progress = parseInt((score / goalCount) * 100);

  if (exerciseStartFlag && score === 0) {
    setProgress(0);
  } else if (score === 0) {
    setProgress(100);
  } else {
    setProgress(progress);
  }

  progressText.textContent = `${progress}%`;
  currentCountText.textContent = `${score} 개`;
  goalCountText.textContent = `${goalCount} 개`;
}

// // 모달
// const modal = document.getElementById("modal");
// function showModal() {
//   modal.style.visibility = "visible";
//   modal.style.opacity = 1;
// }

// function hideModal() {
//   modal.style.visibility = "hidden";
//   modal.style.opacity = 0;
// }
