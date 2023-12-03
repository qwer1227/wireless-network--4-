// Firebase 구성 객체
const firebaseConfig = {
  apiKey: "AIzaSyBGhiclax0v6Onvo1iozBuwUOYrShbbqkI",
  authDomain: "wireless-project-4.firebaseapp.com",
  databaseURL: "https://wireless-project-4-default-rtdb.firebaseio.com",
  projectId: "wireless-project-4",
  storageBucket: "wireless-project-4.appspot.com",
  messagingSenderId: "232862239959",
  appId: "1:232862239959:web:b47a6fa0e315378e263492",
  measurementId: "G-1DFMELVGLH"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Realtime Database에 데이터 저장 함수
function saveCountToFirebase(username, score, goalTime) {
  
  const countRef = ref(database, 'pushup');

  // push() 함수를 사용하여 고유한 키로 데이터 저장
  push(countRef, {
      username : username,
      count: score,
      timestamp: goalTime
  });
};