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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 데이터 추가 예제
function saveCountToFirebase(username, score, goalTime, exercise) {
  return new Promise((resolve, reject) => {
    const countRef = database.ref(exercise);

    // push() 함수를 사용하여 고유한 키로 데이터 저장
    countRef.push({
      username: username,
      count: score,
      timestamp: goalTime
    }, (error) => {
      if (error) {
        reject(error); // 저장 중에 오류가 발생하면 프로미스를 reject합니다.
      } else {
        resolve(); // 저장이 성공하면 프로미스를 resolve합니다.
      }
    });
  });
}
