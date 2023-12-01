import cv2
import mediapipe as mp

from model.pose_constants import *
from model.calculate_angle import calculateAngle

mp_pose = mp.solutions.pose

# OpenCV 설정
FONT = cv2.FONT_HERSHEY_SIMPLEX 

# 레이즈 판단을 위한 상수
RAISE_SHOULDER_ANGLE_THRESHOLD = 70  # 레이즈 판단을 위한 어깨 각도 임계값
STAND_SHOULDER_ANGLE_THRESHOLD = 30  # 서있는 자세 판단을 위한 어깨 각도 임계값


def raise_detect(results, score, status, image):
    # 포즈 추적 결과를 그림
    if results.pose_landmarks:
        right_shoulder = results.pose_landmarks.landmark[RIGHT_SHOULDER]   # 오른쪽 어깨
        right_elbow = results.pose_landmarks.landmark[RIGHT_ELBOW]         # 오른쪽 팔꿈치
        right_hip = results.pose_landmarks.landmark[RIGHT_HIP]             # 오른쪽 엉덩이

        left_shoulder = results.pose_landmarks.landmark[LEFT_SHOULDER]     # 왼쪽 어깨
        left_elbow = results.pose_landmarks.landmark[LEFT_ELBOW]           # 왼쪽 팔꿈치
        left_hip = results.pose_landmarks.landmark[LEFT_HIP]               # 왼쪽 엉덩이

        # 랜드마크마다 x, y, visibility 값이 담겨있음

        # 팔꿈치 각도 계산
        right_shoulder_angle = calculateAngle(right_hip, right_shoulder, right_elbow)
        left_shoulder_angle = calculateAngle(left_hip, left_shoulder, left_elbow)

        if left_shoulder_angle > 180:
            left_shoulder_angle = 360 - left_shoulder_angle

        cv2.putText(image, f"Right shoulder angle: {right_shoulder_angle:.2f}", (10, 50), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Left shoulder angle: {left_shoulder_angle:.2f}", (10, 100), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Score: {score}", (10, 150), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # 사이드 레터럴 레이즈 판단
        if right_shoulder_angle > RAISE_SHOULDER_ANGLE_THRESHOLD and \
            left_shoulder_angle > RAISE_SHOULDER_ANGLE_THRESHOLD and \
            status == "stand":
                status = "raise"
        elif right_shoulder_angle < RAISE_SHOULDER_ANGLE_THRESHOLD and \
            left_shoulder_angle < RAISE_SHOULDER_ANGLE_THRESHOLD and \
            left_shoulder_angle < STAND_SHOULDER_ANGLE_THRESHOLD and \
            right_shoulder_angle < STAND_SHOULDER_ANGLE_THRESHOLD and \
            status == "raise":
                status = "stand"
                score += 1

    return score, status, image