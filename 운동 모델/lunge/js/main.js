// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel

// Teachable Machine 모델 관련 변수
// const URL = "model/"; // 오프라인 모델 경로
const URL = "https://teachablemachine.withgoogle.com/models/XZoOor9uB/"; // 런지 온라인 모델
// const URL = "https://teachablemachine.withgoogle.com/models/aC0ukQBIm/"; // 왼팔 들어 내려 온라인 모델
let model, webcam, ctx, maxPredictions; // 모델, 웹캠, 캔버스, 예측값 최대값

// 운동 관련 변수
let count = 0; // 현재 운동 횟수
let lastAction = "stand"; // 마지막으로 했던 동작 (lunge, stand, nothing)

// 플래그 변수
let exerciseStartFlag = false; // 운동 시작 여부 (시작 버튼을 누르면 true)
let breakLoopFlag = true; // 루프 종료 여부 (운동 종료 시 false)
let timerStartFlag = false; // 타이머 시작 여부 (타이머가 시작되면 true)

// 프로그레스 링에서 사용할 변수
let progress = 0; // 진행도
let remainTime = 0; // 운동 종료 시간

// 파라미터로 목표 횟수와 제한 시간을 받아옴
const param = new URLSearchParams(window.location.search); // URL 파라미터
const goalCount = param.get("goalCount") ? param.get("goalCount") : 20; // 목표 횟수
const goalTime = param.get("goalTime") ? param.get("goalTime") : 120; // 제한 시간

// DOM 요소
const labelContainer = document.getElementById("label-container");
const countContainer = document.getElementById("count-container");
const logContainer = document.getElementById("log-container");

init();

// 카운트 다운 시작
function start() {
  const clock = document.getElementById("clock");
  const span = document.querySelector("#clock span");

  let countdown = 3; // 카운트 다운 시작 숫자
  exerciseStartFlag = false; // 카운트 다운 시작 여부 초기화

  span.innerHTML = `${countdown} 초 후 시작`;
  clock.style.display = "block";

  count = 0; // 현재 횟수 초기화
  updateProgress(); // 프로그레스 링 업데이트

  const timer = setInterval(() => {
    countdown--;

    if (countdown == 0) {
      span.innerHTML = "시작";
    } else if (countdown == -1) {
      clock.style.display = "none";

      exerciseStartFlag = true;

      updateProgress(); // 프로그레스 링 업데이트
      timerText.textContent = `남은 시간 : ${goalTime} 초`;
      clearInterval(timer);
    } else {
      span.innerHTML = `${countdown} 초 후 시작`;
    }
  }, 1000);
}

// 웹캠 설정 및 이미지 모델 로드
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // 모델과 메타데이터를 로드합니다.
  // Refer to tmPose.loadFromFiles() in the API to support files from a file picker
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const camMaxWidth = 200;
  const camMaxHeight = 200;
  const flip = true; // 카메라 반전
  webcam = new tmPose.Webcam(camMaxWidth, camMaxHeight, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  const canvas = document.getElementById("canvas");
  canvas.width = camMaxWidth;
  canvas.height = camMaxHeight;
  ctx = canvas.getContext("2d");

  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();

  if (breakLoopFlag) {
    // 운동 종료 전까지 루프
    if (exerciseStartFlag && !timerStartFlag) {
      startTimer(goalTime);
    }
    window.requestAnimationFrame(loop);
  } else {
    // 운동 종료 시
    saveScoreToFirebase("lunge", count, goalTime); // 데이터베이스에 저장
  }
}

async function predict() {
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

  const prediction = await model.predict(posenetOutput);
  const lunge = prediction[0].probability.toFixed(2); // 런지
  const stand = prediction[1].probability.toFixed(2); // 스탠드
  // const nothing = prediction[2].probability.toFixed(2); // 런지 또는 스탠드로 고정되는 버그를 막기위해 넣어둠

  for (let i = 0; i < maxPredictions; i++) {
    className = prediction[i].className; // 클래스 이름
    probability = prediction[i].probability.toFixed(2); // 예측값

    labelContainer.childNodes[i].innerHTML = `${className} : ${probability}`; // 예측값을 화면에 표시
    countContainer.innerHTML = `카운트 : ${count}`; // 카운트를 화면에 표시
  }

  // 시작 버튼을 누르면 횟수 체크 시작
  if (exerciseStartFlag) {
    // 런지, 스탠드를 판단
    if (lunge > 0.85 && lastAction == "stand") {
      lastAction = "lunge";
    } else if (stand > 0.85 && lastAction == "lunge") {
      lastAction = "stand";

      count++; // 카운트 증가
      updateProgress(); // 프로그레스 링 업데이트

      // 목표 횟수를 달성하면 횟수 체크 종료
      if (count == goalCount) {
        exerciseStartFlag = false;
      }
    }
  }

  // finally draw the poses
  drawPose(pose);
}

function drawPose(pose) {
  ctx.drawImage(webcam.canvas, 0, 0);

  // draw the keypoints and skeleton
  if (pose) {
    const minPartConfidence = 0.5;
    tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
    tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
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

updateProgress();
function updateProgress() {
  progress = parseInt((count / goalCount) * 100);

  if (exerciseStartFlag && count === 0) {
    setProgress(0);
  } else if (count === 0) {
    setProgress(100);
  } else {
    setProgress(progress);
  }

  progressText.textContent = `${progress}%`;
  currentCountText.textContent = `${count} 개`;
  goalCountText.textContent = `${goalCount} 개`;
}

function startTimer() {
  remainTime = goalTime;

  timer = setInterval(function () {
    remainTime--;

    timerText.textContent = `남은 시간 : ${remainTime} 초`;

    if (remainTime <= 0 || !exerciseStartFlag) {
      clearInterval(timer);
      breakLoopFlag = false;
    }
  }, 1000);

  timerStartFlag = true;
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

// // 모바일이 아닐때만 카메라 존재 여부 확인
// // 안그러면 tmPose 객체에서 오류남
// if (!isMobile()) {
//   checkCamera();
// }

// // 모바일 여부 확인
// function isMobile() {
//   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// }

// let haveCamera = true; // 카메라 존재 여부
// // 카메라 존재 여부 확인
// function checkCamera() {
//   navigator.mediaDevices
//     .getUserMedia({
//       video: true,
//     })
//     .catch(function (error) {
//       console.log(error);

//       if (error.name == "NotAllowedError") {
//         alert("카메라 사용 권한을 허용해주세요.");
//       } else if (error.name == "NotFoundError") {
//         alert("카메라를 찾을 수 없습니다.");
//       } else {
//         alert("카메라 관련 알 수 없는 에러가 발생했습니다.");
//       }

//       haveCamera = false;
//     });
// }

// 포즈 ID 파트
// https://www.tensorflow.org/lite/examples/pose_estimation/overview?hl=ko

// // 카메라 해상도 최대값 구하기
// // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

// navigator.mediaDevices
//   .getUserMedia({ video: true })
//   .then(function (stream) {
//     var track = stream.getVideoTracks()[0];
//     var capabilities = track.getCapabilities();

//     camMaxWidth = capabilities.width.max;
//     camMaxHeight = capabilities.height.max;

//     track.applyConstraints({
//       width: { ideal: capabilities.width.max },
//       height: { ideal: capabilities.height.max },
//     });
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
