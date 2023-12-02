import math

# 앵글 계산 함수
# x, y, z 3개의 landmark 사이의 각도를 계산할 수 있는 함수를 생성한다.
def calculateAngle(landmark1, landmark2, landmark3):
    # 필요한 랜드마크 좌표를 얻어옴
    # 이미지를 뒤집었기 때문에 x 좌표를 반전시킴 (꼼수)
    x1, y1, _ = 1 - landmark1.x, landmark1.y, landmark1.z # 첫번째 라인 시작점
    x2, y2, _ = 1 - landmark2.x, landmark2.y, landmark2.z # 첫번째 라인 끝점과 두번째 라인 시작점
    x3, y3, _ = 1 - landmark3.x, landmark3.y, landmark3.z # 두번째 라인 끝점

    # 세 점 사이의 각도를 계산
    angle = math.degrees(math.atan2(y3 - y2, x3 - x2) - math.atan2(y1 - y2, x1 - x2))
    
    # 위 문장을 아래에 해석해줘
    if angle < 0:
        # 찾은 각도에 360을 더함
        angle += 360

    # 계산된 각도를 반환
    return angle