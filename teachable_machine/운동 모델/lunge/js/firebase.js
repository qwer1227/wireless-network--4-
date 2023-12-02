// Firebase 구성 객체
const firebaseConfig = {
  apiKey: "AIzaSyAVk9744dXWQRJcNC1IH1n1qGEt_T7Whf0",
  authDomain: "wirelessnetworkproject-ba412.firebaseapp.com",
  databaseURL: "https://wirelessnetworkproject-ba412-default-rtdb.firebaseio.com",
  projectId: "wirelessnetworkproject-ba412",
  storageBucket: "wirelessnetworkproject-ba412.appspot.com",
  messagingSenderId: "869083151927",
  appId: "1:869083151927:web:92be92780dab8c395689b2",
  measurementId: "G-TKN1MLNDGY",
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 데이터 추가 예제
function saveScoreToFirebase(type, count, timestamp) {
  const scoreRef = database.ref(type);

  // push() 함수를 사용하여 고유한 키로 데이터 저장
  scoreRef.push({ count: count, timestamp: timestamp });
}
