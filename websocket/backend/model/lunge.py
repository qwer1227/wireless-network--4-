import cv2
import mediapipe as mp

from lib.pose_constants import *
from lib.calculate_angle import calculateAngle

mp_pose = mp.solutions.pose

# OpenCV 설정
FONT_FAMILY = cv2.FONT_HERSHEY_SIMPLEX 
FONT_SIZE = 0.8
FONT_COLOR = (0, 0, 255)
FONT_THICKNESS = 2

# 런지 판단을 위한 상수
LUNGE_KNEE_ANGLE_THRESHOLD = 130  # 무릎 각도 임계값
LUNGE_HIP_DISTANCE_THRESHOLD = 0.2  # 엉덩이 간격 임계값
LUNGE_KNEE_DISTANCE_THRESHOLD = 0.1  # 무릎 간격 임계값


def lunge_detect(results, score, status, image):
    # 포즈 추적 결과를 그림
    if results.pose_landmarks:
        left_hip = results.pose_landmarks.landmark[LEFT_HIP]             # 왼쪽 엉덩이
        left_knee = results.pose_landmarks.landmark[LEFT_KNEE]           # 왼쪽 무릎
        left_ankle = results.pose_landmarks.landmark[LEFT_ANKLE]         # 왼쪽 발목

        right_hip = results.pose_landmarks.landmark[RIGHT_HIP]           # 오른쪽 엉덩이
        right_knee = results.pose_landmarks.landmark[RIGHT_KNEE]         # 오른쪽 무릎
        right_ankle = results.pose_landmarks.landmark[RIGHT_ANKLE]       # 오른쪽 발목

        # 랜드마크마다 x, y, visibility 값이 담겨있음

        # 무릎 각도 계산
        left_knee_angle = calculateAngle(left_hip, left_knee, left_ankle)
        right_knee_angle = calculateAngle(right_hip, right_knee, right_ankle)

        # 엉덩이 간격 계산
        hip_distance = abs(left_hip.x - right_hip.x)

        # 무릎 간격 계산
        knee_distance = abs(right_knee.x - left_knee.x)

        # 무릎 각도가 임계값보다 작고 엉덩이 간격이 임계값보다 작으면 스쿼트로 판단
        # 왼쪽을 바라보고 있을 때는 180도가 넘어가기때문에 360에서 빼줘야 함 (꼼수)
        if right_knee_angle > 180 and left_knee_angle > 180:
            right_knee_angle = 360 - right_knee_angle
            left_knee_angle = 360 - left_knee_angle

        cv2.putText(image, f"Left Knee Angle: {left_knee_angle:.2f}", (10, 30), FONT_FAMILY, FONT_SIZE, FONT_COLOR, FONT_THICKNESS, cv2.LINE_AA)
        cv2.putText(image, f"Right Knee Angle: {right_knee_angle:.2f}", (10, 60), FONT_FAMILY, FONT_SIZE, FONT_COLOR, FONT_THICKNESS, cv2.LINE_AA)
        cv2.putText(image, f"Hip Distance: {hip_distance:.2f}", (10, 90), FONT_FAMILY, FONT_SIZE, FONT_COLOR, FONT_THICKNESS, cv2.LINE_AA)
        cv2.putText(image, f"Knee Distance: {knee_distance:.2f}", (10, 120), FONT_FAMILY, FONT_SIZE, FONT_COLOR, FONT_THICKNESS, cv2.LINE_AA)
        cv2.putText(image, f"Score: {score}", (10, 150), FONT_FAMILY, FONT_SIZE, FONT_COLOR, FONT_THICKNESS, cv2.LINE_AA)

        # 런지 판단
        if left_knee_angle < LUNGE_KNEE_ANGLE_THRESHOLD and \
            right_knee_angle < LUNGE_KNEE_ANGLE_THRESHOLD and \
            hip_distance < LUNGE_HIP_DISTANCE_THRESHOLD and \
            knee_distance > LUNGE_KNEE_DISTANCE_THRESHOLD and \
            status == "stand":
                status = "lunge"
        elif left_knee_angle > LUNGE_KNEE_ANGLE_THRESHOLD and \
            right_knee_angle > LUNGE_KNEE_ANGLE_THRESHOLD and \
            hip_distance < LUNGE_HIP_DISTANCE_THRESHOLD and \
            knee_distance > LUNGE_KNEE_DISTANCE_THRESHOLD and \
            status == "lunge":
                status = "stand"
                score += 1

    return score, status, image

