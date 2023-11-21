"use strict";

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pcConfig = {
  iceServers: [
    {
      urls: "turn:dhwngjs01.iptime.org:3478?transport=tcp",
      username: "randolph",
      credential: "12341234",
    },
  ],
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

/////////////////////////////////////////////

var room = "foo";
// Could prompt for room name:
// room = prompt("Enter room name:");

var socket = io.connect();

if (room !== "") {
  socket.emit("create or join", room);
  console.log("방을 만들거나 가입하려고 시도했습니다. :", room);
}

socket.on("created", function (room) {
  console.log("방 생성됨 : " + room);
  isInitiator = true;
});

socket.on("full", function (room) {
  console.log("방 " + room + " 에는 인원이 가득찼습니다.");
});

socket.on("join", function (room) {
  console.log("다른 피어가 룸에 가입하도록 요청했습니다. : " + room);
  console.log("이 피어는 룸의 방장입니다. : " + room + " !");
  isChannelReady = true;
});

socket.on("joined", function (room) {
  console.log("방에 들어옴 : " + room);
  isChannelReady = true;
});

socket.on("log", function (array) {
  console.log.apply(console, array);
});

////////////////////////////////////////////////

function sendMessage(message) {
  console.log("클라이언트가 메시지를 보내는 중 :", message);
  socket.emit("message", message);
}

// This client receives a message
socket.on("message", function (message) {
  console.log("클라이언트가 받은 메시지 :", message);
  if (message === "got user media") {
    maybeStart();
  } else if (message.type === "offer") {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === "answer" && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === "candidate" && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });
    pc.addIceCandidate(candidate);
  } else if (message === "bye" && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector("#localVideo");
var remoteVideo = document.querySelector("#remoteVideo");

const mediaOption = {
  audio: false,
  video: {
    mandatory: {
      maxWidth: 1280,
      maxHeight: 720,
      maxFrameRate: 60,
    },
    optional: [{ facingMode: "user" }],
  },
};

navigator.mediaDevices
  .getUserMedia(mediaOption)
  .then(gotStream)
  .catch(function (e) {
    alert("getUserMedia() 오류 : " + e.name);
  });

function gotStream(stream) {
  console.log("로컬 스트림 추가 중.");
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage("got user media");
  if (isInitiator) {
    maybeStart();
  }
}

var constraints = {
  video: true,
};

console.log("제약 조건이 있는 사용자 미디어 가져오기", constraints);

function maybeStart() {
  console.log(">>>>>>> maybeStart() ", isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== "undefined" && isChannelReady) {
    console.log(">>>>>> PeerConnection 생성");
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log("isInitiator", isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function () {
  sendMessage("bye");
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log("RTCPeerConnnection 생성됨.");
  } catch (e) {
    console.log("PeerConnection 만들지 못했습니다. 예외 :" + e.message);
    alert("RTCPeerConnection 객체를 만들 수 없습니다.");
    return;
  }
}

function handleIceCandidate(event) {
  console.log("icecandidate event: ", event);
  if (event.candidate) {
    sendMessage({
      type: "candidate",
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
    });
  } else {
    console.log("candidate 끝.");
  }
}

function handleCreateOfferError(event) {
  console.log("createOffer() 오류 :", event);
}

function doCall() {
  console.log("피어에 오퍼 보내기");
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log("피어에 답변 보내기.");
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log("setLocalAndSendMessage 발송 메시지", sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace("세션 설명을 만들지 못했습니다. " + error.toString());
}

function handleRemoteStreamAdded(event) {
  console.log("원격 스트림이 추가됨.");
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log("원격 스트림이 제거되었습니다. 이벤트 :", event);
}

function hangup() {
  console.log("끊음.");
  stop();
  sendMessage("bye");
}

function handleRemoteHangup() {
  console.log("세션 종료.");
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}
