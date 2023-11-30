# pose_constants.py

import mediapipe as mp

mp_pose = mp.solutions.pose

# 간략한 상수로 PoseLandmark 변수 정의
NOSE = mp_pose.PoseLandmark.NOSE                          # 코
RIGHT_EYE_INNER = mp_pose.PoseLandmark.LEFT_EYE_INNER      # 왼쪽 눈 (안쪽)
RIGHT_EYE = mp_pose.PoseLandmark.LEFT_EYE                  # 왼쪽 눈
LEFT_EYE_INNER = mp_pose.PoseLandmark.RIGHT_EYE_INNER    # 오른쪽 눈 (안쪽)
LEFT_EYE = mp_pose.PoseLandmark.RIGHT_EYE                # 오른쪽 눈
RIGHT_EAR = mp_pose.PoseLandmark.LEFT_EAR                  # 왼쪽 귀
LEFT_EAR = mp_pose.PoseLandmark.RIGHT_EAR                # 오른쪽 귀
MOUTH_RIGHT = mp_pose.PoseLandmark.MOUTH_LEFT              # 왼쪽 입술
MOUTH_LEFT = mp_pose.PoseLandmark.MOUTH_RIGHT            # 오른쪽 입술
RIGHT_SHOULDER = mp_pose.PoseLandmark.LEFT_SHOULDER        # 왼쪽 어깨
LEFT_SHOULDER = mp_pose.PoseLandmark.RIGHT_SHOULDER      # 오른쪽 어깨
RIGHT_ELBOW = mp_pose.PoseLandmark.LEFT_ELBOW              # 왼쪽 팔꿈치
LEFT_ELBOW = mp_pose.PoseLandmark.RIGHT_ELBOW            # 오른쪽 팔꿈치
RIGHT_WRIST = mp_pose.PoseLandmark.LEFT_WRIST              # 왼쪽 손목
LEFT_WRIST = mp_pose.PoseLandmark.RIGHT_WRIST            # 오른쪽 손목
RIGHT_HIP = mp_pose.PoseLandmark.LEFT_HIP                  # 왼쪽 엉덩이
LEFT_HIP = mp_pose.PoseLandmark.RIGHT_HIP                # 오른쪽 엉덩이
RIGHT_KNEE = mp_pose.PoseLandmark.LEFT_KNEE                # 왼쪽 무릎
LEFT_KNEE = mp_pose.PoseLandmark.RIGHT_KNEE              # 오른쪽 무릎
RIGHT_ANKLE = mp_pose.PoseLandmark.LEFT_ANKLE              # 왼쪽 발목
LEFT_ANKLE = mp_pose.PoseLandmark.RIGHT_ANKLE            # 오른쪽 발목
RIGHT_HEEL = mp_pose.PoseLandmark.LEFT_HEEL                # 왼쪽 발뒤꿈치
LEFT_HEEL = mp_pose.PoseLandmark.RIGHT_HEEL              # 오른쪽 발뒤꿈치
RIGHT_FOOT_INDEX = mp_pose.PoseLandmark.LEFT_FOOT_INDEX    # 왼쪽 발가락
LEFT_FOOT_INDEX = mp_pose.PoseLandmark.RIGHT_FOOT_INDEX  # 오른쪽 발가락
