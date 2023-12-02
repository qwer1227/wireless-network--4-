import socket
import asyncio
import base64
import cv2
import numpy as np
import mediapipe as mp
import ssl
import json
import datetime

import websockets
from websockets.exceptions import ConnectionClosed

import warnings
warnings.simplefilter("ignore", DeprecationWarning)

from model.squat import squat_detect
from model.pushup import pushup_detect
from model.side_lateral_raise import raise_detect
from model.lunge import lunge_detect

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils


# 클라이언트 전체 목록
clients = []

# 클라이언트 목록을 클라이언트에게 전송하는 함수
async def sendClientsList(websocket):
    global clients
    
    ip = str(websocket.remote_address[0]) # 클라이언트의 IP 주소
    port = str(websocket.remote_address[1]) # 클라이언트의 포트 번호
    date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") # 연결 시간

    print(f"Client connected from {ip}:{port} ({date})") # 클라이언트가 연결되었음을 출력

    # 클라이언트 목록에 추가
    clients.insert(0, ip+"|"+port+"|"+date)

    if len(clients) > 10:
        # 클라이언트 목록이 10개를 초과하면 가장 오래된 클라이언트를 삭제
        clients.pop()
    
    # 클라이언트 목록 전송
    await websocket.send(json.dumps({ "clients" : clients }))

# 클라이언트가 연결했을 때 호출되는 함수
async def handle(websocket, path):
    await sendClientsList(websocket)

    pose_tracker = mp_pose.Pose() # 포즈 추적 모델 로드
    
    status = "stand"
    score = 0
    exercise = ""

    # 클라이언트로부터 메시지를 계속 받음
    try:
        async for msg in websocket:
            msg = json.loads(msg)

            exercise = msg.get("exercise") if msg.get("exercise") != None else exercise # 운동 종류
            imgData = msg.get("imgData")
            
            if(imgData == None):
                continue

            # 클라이언트로부터 받은 이미지 데이터를 디코딩
            image = cv2.imdecode(np.fromstring(base64.b64decode(imgData.split(',')[1]), np.uint8), cv2.IMREAD_COLOR)

            # 거울모드 ON
            image = cv2.flip(image, 1)

            # 포즈 추적을 위해 이미지를 그레이스케일로 변환
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # 포즈 추적 수행
            results = pose_tracker.process(image_rgb)

            if exercise == "squat":
                # 스쿼트 판단
                score, status, image = squat_detect(results, score, status, image)
            elif exercise == "pushup":
                # 푸쉬업 판단
                score, status, image = pushup_detect(results, score, status, image)
            elif exercise == "raise":
                # 레이즈 판단
                score, status, image = raise_detect(results, score, status, image)
            elif exercise == "lunge":
                # 런지 판단
                score, status, image = lunge_detect(results, score, status, image)



            # 포즈 추적 결과를 이미지에 그림
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # 클라이언트로 이미지 전송
            _, buffer = cv2.imencode('.jpg', image)
            image_encoded = 'data:image/jpeg;base64,' + base64.b64encode(buffer).decode('utf-8')


            # 클라이언트로 전송할 데이터 생성 (JSON 형식으로 해야 여러 종류의 데이터를 한번에 전송 가능)
            data = {
                "image" : image_encoded,
                "clients": clients,
                "score" : score,
            }

            data = json.dumps(data)

            # 클라이언트로 데이터 전송
            await websocket.send(data)

            # cv2.imshow('Pose Tracking', cap) # 이미지 출력
            # cv2.waitKey(1) # 1ms 동안 키 입력 대기
    
    except ConnectionClosed as e:
         # 연결이 종료되었을 때
        print(f"Connection closed with code {e.code}, reason: {e.reason}")

# SSL/TLS 설정
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('./cert/public.pem', keyfile='./cert/private.pem')

my_ip_address = socket.gethostbyname(socket.gethostname())
port = 3000

# 서버 생성
start_server = websockets.serve(
    handle, my_ip_address, port, ssl=ssl_context
)

print('WebSocket Secure Server Listening on port 3000...')
print('Press Ctrl+C to shut down the server...')
print()

# 클라이언트 연결 대기
try:
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
    pass
finally:
    print("Server shutting down...")