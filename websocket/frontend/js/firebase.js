// Firebase 구성 객체
const firebaseConfig = {
  apiKey: "AIzaSyBGhiclax0v6Onvo1iozBuwUOYrShbbqkI",
  authDomain: "wireless-project-4.firebaseapp.com",
  databaseURL: "https://wireless-project-4-default-rtdb.firebaseio.com",
  projectId: "wireless-project-4",
  storageBucket: "wireless-project-4.appspot.com",
  messagingSenderId: "232862239959",
  appId: "1:232862239959:web:b47a6fa0e315378e263492",
  measurementId: "G-1DFMELVGLH",
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 운동 점수 저장
function saveCountToFirebase(username, score, goalTime, exercise) {
  return new Promise((resolve, reject) => {
    const countRef = database.ref(exercise);

    // push() 함수를 사용하여 고유한 키로 데이터 저장
    countRef
      .push(
        {
          username: username,
          count: score,
          timestamp: goalTime,
        },
        (error) => {
          if (error) {
            reject(error); // 저장 중에 오류가 발생하면 프로미스를 reject합니다.
          } else {
            resolve(); // 저장이 성공하면 프로미스를 resolve합니다.
          }
        }
      )
      .catch((error) => {
        reject(error);
      });
  });
}

// 운동 점수 불러오기
function getCountFromFirebase(exercise, timestamp) {
  return new Promise((resolve, reject) => {
    const exerciseRef = database.ref(exercise);

    const exerciseScoreList = [];

    exerciseRef
      .once("value")
      .then((snapshot) => {
        const exerciseDataList = snapshot.val();

        for (let key in exerciseDataList) {
          let exerciseData = exerciseDataList[key];
          let exerciseUsername = exerciseData.username;
          let exerciseCount = parseInt(exerciseData.count);
          let exerciseTimestamp = parseInt(exerciseData.timestamp);

          if (exerciseTimestamp === timestamp) {
            exerciseScoreList.push({ count: exerciseCount, username: exerciseUsername });
          }
        }

        exerciseScoreList.sort((a, b) => {
          return b.count - a.count;
        });

        const topTenList = exerciseScoreList.slice(0, 10);

        resolve(topTenList);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// 등록된 모든 시간 불러오기
function getAllTimestampFromFirebase(exercise) {
  return new Promise((resolve, reject) => {
    const exerciseRef = database.ref(exercise);

    exerciseRef
      .once("value")
      .then((snapshot) => {
        const exerciseDataList = snapshot.val();

        const timestampList = [];

        for (let key in exerciseDataList) {
          let exerciseData = exerciseDataList[key];
          let timestamp = parseInt(exerciseData.timestamp);

          timestampList.push(timestamp);
        }

        timestampList.sort((a, b) => a - b); // 오름차순 정렬
        const timestampSet = new Set(timestampList); // 중복 제거
        const timestampUniqueList = Array.from(timestampSet); // 다시 배열로 변환

        resolve(timestampUniqueList);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
