import cv2
import mediapipe as mp

from model.pose_constants import *
from model.calculate_angle import calculateAngle

mp_pose = mp.solutions.pose

# OpenCV 설정
FONT = cv2.FONT_HERSHEY_SIMPLEX 

# 스쿼트 판단을 위한 상수
SQUAT_KNEE_ANGLE_THRESHOLD = 130  # 무릎 각도 임계값
SQUAT_HIP_DISTANCE_THRESHOLD = 0.2  # 엉덩이 간격 임계값
SQUAT_KNEE_DISTANCE_THRESHOLD = 0.1  # 무릎 간격 임계값

def squat_detect(results, score, status, image):
    # 포즈 추적 결과를 그림
    if results.pose_landmarks:
        right_knee = results.pose_landmarks.landmark[RIGHT_KNEE]   # 오른쪽 무릎
        right_hip = results.pose_landmarks.landmark[RIGHT_HIP]     # 오른쪽 엉덩이
        right_ankle = results.pose_landmarks.landmark[RIGHT_ANKLE] # 오른쪽 발목

        left_knee = results.pose_landmarks.landmark[LEFT_KNEE]     # 왼쪽 무릎
        left_hip = results.pose_landmarks.landmark[LEFT_HIP]       # 왼쪽 엉덩이
        left_ankle = results.pose_landmarks.landmark[LEFT_ANKLE]   # 왼쪽 발목

        # 랜드마크마다 x, y, visibility 값이 담겨있음

        # 무릎 각도 계산
        right_knee_angle = calculateAngle(right_hip, right_knee, right_ankle)
        left_knee_angle = calculateAngle(left_hip, left_knee, left_ankle)

        # 엉덩이 간격 계산
        hip_distance = abs(right_hip.x - left_hip.x)

        # 무릎 간격 계산
        knee_distance = abs(right_knee.x - left_knee.x)

        # 무릎 각도가 임계값보다 작고 엉덩이 간격이 임계값보다 작으면 스쿼트로 판단
        # 왼쪽을 바라보고 있을 때는 180도가 넘어가면 360에서 빼줘야 함 (꼼수)
        if right_knee_angle > 180 and left_knee_angle > 180:
            right_knee_angle = 360 - right_knee_angle
            left_knee_angle = 360 - left_knee_angle

        cv2.putText(image, f"Right knee angle: {right_knee_angle:.2f}", (10, 50), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Left knee angle: {left_knee_angle:.2f}", (10, 100), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Hip distance: {hip_distance:.2f}", (10, 150), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Knee distance: {knee_distance:.2f}", (10, 200), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(image, f"Score: {score}", (10, 250), FONT, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # 스쿼트 판단
        # 양쪽 무릎을 130도까지 굽히고 (서있는게 180도로 인식)
        # 엉덩이가 서로 붙어있고
        # 무릎이 서로 붙어있어야지 스쿼트로 인식
        if right_knee_angle < SQUAT_KNEE_ANGLE_THRESHOLD and \
            left_knee_angle < SQUAT_KNEE_ANGLE_THRESHOLD and \
            hip_distance < SQUAT_HIP_DISTANCE_THRESHOLD and \
            knee_distance < SQUAT_KNEE_DISTANCE_THRESHOLD and \
            status == "stand":
                status = "squat"

        # 스쿼트 자세에서 일어서는 자세로 돌아왔을 때 점수를 1점 올림
        if right_knee_angle > SQUAT_KNEE_ANGLE_THRESHOLD and \
            left_knee_angle > SQUAT_KNEE_ANGLE_THRESHOLD and \
            hip_distance < SQUAT_HIP_DISTANCE_THRESHOLD and \
            knee_distance < SQUAT_KNEE_DISTANCE_THRESHOLD and \
            status == "squat":
                status = "stand"
                score += 1

    return score, status