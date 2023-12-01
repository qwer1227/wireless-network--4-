var startFlag = false;

const w = 640;
const h = 480;
const url = "wss://dhwngjs01.ddns.net:3000"; // WebSocket 서버 주소
const ws = new WebSocket(url);

const video = document.getElementById("videoInput");
const canvas = document.getElementById("videoOutput");
const img = document.getElementById("receivedImage");
const currentStatus = document.getElementById("currentStatus");
const clientList = document.getElementById("clientList");

video.width = w;
video.height = h;

canvas.width = w;
canvas.height = h;
const ctx = canvas.getContext("2d");

var streamInterval;
var score = 0;

// 로드 완료 시 실행
window.onload = function () {
  getUserMedia();
  processImage();
};

// 서버 연결 시 실행
ws.onopen = function () {
  showCurrentStatus(ws.readyState); // 웹 소켓 연결 상태 표시
  sendDataToServer({ exercise: "raise" }); // 서버에 운동 종류 전송
};

// 서버에서 메시지 수신 시 실행
ws.onmessage = function (msg) {
  data = JSON.parse(msg.data);

  // 연결한 클라이언트 리스트 갱신
  if (data.clients) showClientsList(data.clients);

  // 점수 갱신
  if (data.score != undefined) score = data.score;
  document.getElementById("score").innerHTML = score;

  // 이미지 데이터 수신
  if (startFlag) {
    img.src = data.image;
    currentStatus.innerHTML = "이미지 데이터 송수신 중...";
  }
};

// 캔버스에 웹 캠 영상 출력
function processImage() {
  ctx.drawImage(video, 0, 0, w, h);
  setTimeout(processImage, 1000 / 60); // 사용자 웹 캠 프레임레이트 설정 (60fps)
}

// Send 버튼 클릭 시 실행
function stream() {
  // 이미 전송 중인지 확인
  if (startFlag) {
    currentStatus.innerHTML = "이미 전송 중입니다.";
    return;
  }

  startFlag = true; // Send 버튼 클릭 여부
  streamInterval = setInterval(sendImage, 60); // 이미지 전송 간격 설정 (60이 가장 적당함)

  function sendImage() {
    // 서버 연결 상태 확인 (연결이 끊어지면 전송 중지)
    if (ws.readyState != 1) {
      showCurrentStatus(ws.readyState);
      startFlag = false;
      clearInterval(streamInterval);
      return;
    }

    let imgData = canvas.toDataURL("image/jpeg", 0.5); // 0.5 = 50% quality
    sendDataToServer({ imgData: imgData }); // 서버로 이미지 데이터 전송
  }
}

// 웹 캠 연결
function getUserMedia() {
  const constraints = { audio: false, video: true }; // 오디오, 비디오 사용 여부
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia; // 크로스 브라우징

  navigator.getUserMedia(constraints, successCallback, errorCallback); // 웹 캠 연결

  // 웹 캠 연결 성공
  function successCallback(stream) {
    video.srcObject = stream;
    video.play();
  }

  // 웹 캠 연결 실패
  function errorCallback(error) {
    console.log(error);
  }
}

// 웹 소켓 연결 상태 표시
function showCurrentStatus(readyState) {
  if (readyState == 1) {
    currentStatus.innerHTML = "웹 소켓 서버에 연결되었습니다. (정상 연결 중)";
  } else if (readyState == 2) {
    currentStatus.innerHTML = "웹 소켓 서버에 연결 중입니다. (연결을 시도 중 - 연결이 되지 않은 상태)";
  } else if (readyState == 3) {
    currentStatus.innerHTML = "웹 소켓 서버와 연결을 끊는 중입니다. (웹 소켓 서버에 오류가 있는 듯?)";
  } else if (readyState == 4) {
    currentStatus.innerHTML = "웹 소켓 서버와 연결이 끊어졌습니다. (클라이언트가 끊은 듯?)";
  }
}

// 서버에서 받은 클라이언트 리스트 출력
function showClientsList(clients) {
  clientList.innerHTML = "";

  for (var i = 0; i < clients.length; i++) {
    var li = document.createElement("li");
    li.innerHTML = clients[i];
    clientList.appendChild(li);
  }
}

// 서버로 데이터 전송
function sendDataToServer(json) {
  json = JSON.stringify(json);
  ws.send(json);
}
