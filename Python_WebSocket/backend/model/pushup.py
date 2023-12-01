import cv2
import mediapipe as mp

from model.pose_constants import *
from model.calculate_angle import calculateAngle

mp_pose = mp.solutions.pose

# OpenCV 설정
FONT = cv2.FONT_HERSHEY_SIMPLEX 

# 푸쉬업 판단을 위한 상수
PUSHUP_ELBOW_ANGLE_THRESHOLD = 130 # 팔꿈치 각도 임계값

def pushup_detect(results, score, status, image):
    # 포즈 추적 결과를 그림
    if results.pose_landmarks:
        right_shoulder = results.pose_landmarks.landmark[RIGHT_SHOULDER]
        right_elbow = results.pose_landmarks.landmark[RIGHT_ELBOW]
        right_wrist = results.pose_landmarks.landmark[RIGHT_WRIST]

        left_shoulder = results.pose_landmarks.landmark[LEFT_SHOULDER]
        left_elbow = results.pose_landmarks.landmark[LEFT_ELBOW]
        left_wrist = results.pose_landmarks.landmark[LEFT_WRIST]

        # 랜드마크마다 x, y, visibility 값이 담겨있음

        # 팔꿈치 각도 계산
        right_elbow_angle = calculateAngle(right_shoulder, right_elbow, right_wrist)
        left_elbow_angle = calculateAngle(left_shoulder, left_elbow, left_wrist)

        if left_elbow_angle > 180:
            left_elbow_angle = 360 - left_elbow_angle

        cv2.putText(image, f"Right elbow angle: {right_elbow_angle:.2f}", (10, 50), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Left elbow angle: {left_elbow_angle:.2f}", (10, 100), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Score: {score}", (10, 150), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)

        if right_elbow_angle < PUSHUP_ELBOW_ANGLE_THRESHOLD and \
            left_elbow_angle < PUSHUP_ELBOW_ANGLE_THRESHOLD and \
            status == "stand":
                status = "pushup"
        elif right_elbow_angle > PUSHUP_ELBOW_ANGLE_THRESHOLD and \
            left_elbow_angle > PUSHUP_ELBOW_ANGLE_THRESHOLD and \
            status == "pushup":
                status = "stand"
                score += 1
            

    return score, status, image

