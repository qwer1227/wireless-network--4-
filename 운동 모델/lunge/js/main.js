// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
// const URL = "model/"; // 오프라인 모델 경로
const URL = "https://teachablemachine.withgoogle.com/models/XZoOor9uB/"; // 온라인 모델 경로인데 업데이트한 내용이 반영이 안됨;
let model, webcam, ctx, maxPredictions; // 모델, 웹캠, 캔버스, 예측값 최대값
let haveCamera = true; // 카메라 존재 여부
let count = 0; // 카운트
let lastAction = "stand"; // 마지막으로 했던 동작 (lunge, stand, nothing)
let startFlag = false; // 카운트 다운 시작 여부

const labelContainer = document.getElementById("label-container");
const countContainer = document.getElementById("count-container");
const logContainer = document.getElementById("log-container");

// // 모바일이 아닐때만 카메라 존재 여부 확인
// // 안그러면 tmPose 객체에서 오류남
// if (!isMobile()) {
//   checkCamera();
// }

init();

// function isMobile() {
//   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// }

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

// 카운트 다운 시작
function start() {
  const clock = document.getElementById("clock");
  const span = document.querySelector("#clock span");

  if (haveCamera) {
    let count = 3;

    clock.style.display = "block";

    span.innerHTML = `${count} 초 후 시작`;

    const timer = setInterval(() => {
      count--;

      if (count == 0) {
        startFlag = true;
        span.innerHTML = "시작";
      } else if (count == -1) {
        clock.style.display = "none";
        span.innerHTML = "";

        clearInterval(timer);
      } else {
        span.innerHTML = `${count} 초 후 시작`;
      }
    }, 1000);
  } else {
    alert("카메라 달고오셈;");
  }
}

// 웹캠 설정 및 이미지 모델 로드
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  const camMaxWidth = 200;
  const camMaxHeight = 200;

  // 모델과 메타데이터를 로드합니다.
  // Refer to tmPose.loadFromFiles() in the API to support files from a file picker
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
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
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);
  const lunge = prediction[0].probability.toFixed(2); // 런지
  const stand = prediction[1].probability.toFixed(2); // 스탠드
  // const nothing = prediction[2].probability.toFixed(2); // 인식 안될때 런지 또는 스탠드로 바뀌는 버그를 막기위해 넣어둠

  for (let i = 0; i < maxPredictions; i++) {
    className = prediction[i].className; // 클래스 이름
    probability = prediction[i].probability.toFixed(2); // 예측값

    labelContainer.childNodes[i].innerHTML = `${className} : ${probability}`; // 예측값을 화면에 표시
    countContainer.innerHTML = `카운트 : ${count}`; // 카운트를 화면에 표시

    // 시작 버튼을 누르면 횟수 체크
    if (startFlag) {
      // 런지, 스탠드를 판단
      if (lunge > 0.85 && lastAction == "stand") {
        lastAction = "lunge";
      } else if (stand > 0.85 && lastAction == "lunge") {
        lastAction = "stand";

        count++; // 카운트 증가
        updateProgress(); // 진행도 업데이트

        logContainer.innerHTML += `
              <p>
                ${count}회 - ${prediction[0].className} : ${prediction[0].probability.toFixed(15)} | ${prediction[1].className} : ${prediction[1].probability.toFixed(15)}
              </p>
            `;

        console.log(prediction); // 예측값을 콘솔에 표시
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

const radius = circle.r.baseVal.value; // 반지름
const circumference = 2 * Math.PI * radius; // 원의 둘레

circle.style.strokeDasharray = `${circumference} ${circumference}`; // dasharray를 원의 둘레로 설정
circle.style.strokeDashoffset = circumference; // 원의 둘레만큼 dash를 이동시켜서 안보이게 함

let progress = 0; // 진행도
let goalCount = 20; // 목표 카운트
let goalTime = 120; // 목표 시간 (초)

const param = new URLSearchParams(window.location.search); // URL 파라미터

// URL 파라미터에 goalCount 와 goalTime 이 있으면 가져옴
if (param.has("goalCount") && param.has("goalTime")) {
  goalCount = Number(param.get("goalCount"));
  goalTime = Number(param.get("goalTime"));

  // URL 파라미터에 goalCount 와 goalTime 이 없으면 index.html 로 이동
  if (isNaN(goalCount) || isNaN(goalTime)) {
    alert("잘못된 접근입니다.");
    window.location.href = "index.html";
  }

  goalCountText.textContent = `${goalCount} 개`; // 목표 카운트를 화면에 표시
}

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

updateProgress();
function updateProgress() {
  progress = parseInt((count / goalCount) * 100);

  count === 0 ? setProgress(100) : setProgress(progress);

  progressText.textContent = `${progress}%`;
  currentCountText.textContent = `${count} 개`;
  goalCountText.textContent = `${goalCount} 개`;
}

// ID	파트
// https://www.tensorflow.org/lite/examples/pose_estimation/overview?hl=ko

// 카메라 해상도 최대값 구하기
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
//
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
