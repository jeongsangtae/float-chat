# Float Chat (연습 프로젝트)

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

> 실시간 개인 · 그룹 채팅을 지원하는 웹 메신저 프로젝트

## 프로젝트 소개

- Float Chat은 실시간 개인 채팅과 그룹 채팅을 제공하는 웹 채팅 서비스

- Socket.IO를 이용한 실시간 통신과 JWT 기반 인증

- Zustand 상태관리, MongoDB를 이용하여 구현

- 단순 채팅뿐 아니라 실제 메신저에서 사용하는 기능들을 구현하는 것을 목표로 제작

구현 기능

- 친구 검색 및 친구 요청
- 온라인 친구 표시
- 실시간 개인/그룹 채팅
- 그룹 채팅 생성 및 관리
- 그룹 초대 및 나가기
- 그룹 공지 작성 / 수정 / 삭제
- 사용자 프로필 수정
- 프로필 변경 실시간 동기화
- 알림 시스템
- 다양한 UI 테마 지원
- 드래그 앤 드롭을 이용한 그룹 채팅 순서 변경

## 프로젝트 목표

- 실제 메신저와 유사한 기능 구현
- Socket.IO 기반 실시간 데이터 동기화
- Zustand를 활용한 상태 관리 구조 설계 경험
- JWT 인증 및 토큰 관리 구현
- TypeScript 기반의 타입 설계 경험
- 컴포넌트 및 Store 리팩토링 경험

## 화면

(스크린샷 추가 예정)

## 주요 기능

### 회원

- 회원가입
- 로그인
- JWT 인증
- Access Token 재발급
- 로그아웃

### 친구

- 친구 검색
- 친구 요청
- 친구 수락
- 친구 거절
- 친구 삭제
- 온라인 친구 표시
- 실시간 프로필 변경 반영

### 개인 채팅

- 채팅방 생성
- 채팅 전송
- 이미지 전송
- 읽지 않은 메시지
- 실시간 메시지 수신

### 그룹 채팅

- 그룹 생성
- 그룹 수정
- 그룹 삭제
- 그룹 초대
- 그룹 나가기
- 공지 작성
- 공지 수정
- 공지 삭제
- 실시간 사용자 목록

### 알림

- 친구 요청 알림
- 그룹 초대 알림
- 메시지 알림
- 알림 기록

## 기술 스택

### Frontend

React · TypeScript · Zustand · React Router · DnD Kit · Socket.IO Client · React Toastify

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![DnD Kit](https://img.shields.io/badge/DnD_Kit-7C3AED?style=for-the-badge)
![Socket.IO Client](https://img.shields.io/badge/Socket.IO_Client-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![React Toastify](https://img.shields.io/badge/React_Toastify-FF6C37?style=for-the-badge)

### Backend

Node.js · Express · Socket.IO · JWT · bcrypt

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-2E8B57?style=for-the-badge)

### Database

MongoDB

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## 프로젝트 구조

```text
frontend/
├── components      # UI 컴포넌트
├── pages           # 페이지
├── store           # Zustand Store
└── utils           # 공통 함수

backend/
├── data            # MongoDB 관련
├── middlewares     # JWT 인증
├── routes          # API
└── utils           # 공통 함수
```

## 실시간 기능

Socket.IO를 이용하여 다음 기능들을 실시간으로 반영

- 친구 요청
- 친구 삭제
- 친구 수락
- 온라인 상태 변경
- 프로필 변경
- 그룹 초대
- 그룹 삭제
- 그룹 공지 수정
- 채팅 수신

## 🛠️ 트러블 슈팅

### 🔁 Socket 이벤트 중복 등록

**문제**

- 화면 이동 시 socket.on()이 여러 번 등록되어 동일 이벤트가 중복 실행되는 문제가 발생

**원인**

- 화면 이동 및 Store 함수 재호출 시 기존 이벤트 리스너를 제거하지 않아 동일한 이벤트가 계속 누적됨

**해결**

- socket.off()로 기존 리스너를 제거한 뒤 socket.on()을 등록하는 방식으로 중복 등록을 방지

---

### ♻️ Zustand Store 구조 개선

**문제**

- 여러 Store 내의 함수와 Socket 이벤트에서 동일한 상태 변경 로직이 반복됨

**원인**

- 동일한 상태 변경 로직을 각각의 액션 함수와 Socket 이벤트에서 개별적으로 구현하여 코드 중복이 발생

**해결**

- 공통 상태 변경 로직을 별도 함수로 분리하여 액션 함수와 Socket 이벤트에서 함께 재사용

---

### 📌 그룹 채팅 순서 저장

**문제**

- 새로 생성한 그룹 채팅방이 항상 상단에 추가되어 사용자가 원하는 순서를 유지할 수 없었음

**원인**

- 그룹 채팅 순서를 클라이언트 상태에서만 관리하여 새로고침 또는 재조회 시 서버의 기본 정렬 순서로 다시 조회됨

**해결**

- DnD Kit을 이용해 순서를 변경하고 변경된 순서를 사용자별로 DB에 저장

---

### 👤 실시간 프로필 변경 동기화

**문제**

- 동일한 사용자 정보가 여러 Store에 분산되어 있어 프로필 수정 시 일부 화면에만 반영되는 문제가 발생

**원인**

- 사용자 정보를 사용하는 각 Store가 독립적으로 상태를 관리하여 프로필 변경 시 모든 Store가 함께 갱신되지 않음

**해결**

- Socket.IO 이벤트를 이용하여 각 Store에서 해당 사용자의 정보를 찾아 동시에 갱신하도록 구현

## 실행 방법

### FE

```bash
cd frontend
npm install
npm run dev
```

### BE

```bash
cd backend
npm install
npm start
```

## 추후 구현 예정

- [ ] 메시지 읽음 표시
- [ ] 알림 읽음 표시
- [ ] 이메일 인증
- [ ] 모바일 반응형 개선

<!--
### FE

1. 메인 페이지

2. 방 페이지

3. 메인 페이지 컴포넌트

4. 친구 목록 컴포넌트

5. 온라인 친구 컴포넌트

6. 친구 추가 컴포넌트

7. 1:1 채팅 컴포넌트

8. 그룹 채팅 컴포넌트

9. 개인 채팅방 컴포넌트

10. 그룹 채팅방 컴포넌트

11. 그춥 채팅방 추가 컴포넌트

12. 회원가입 컴포넌트

13. 로그인 컴포넌트

14. 프로필 컴포넌트

15. 프로필 수정 컴포넌트

16. 모달 컴포넌트

17. 옵션 컴포넌트

18. 채팅 입력 컴포넌트

19. 오류 관련 컴포넌트

<br />

### BE

1. / (메인 페이지 루트 라우터)

2. /signup (회원가입 라우터)

3. /login (로그인 라우터)

4. /accessToken (액세스 토큰 라우터)

5. /refreshToken (리프레쉬 토큰 라우터)

6. /refreshTokenExp (리프레쉬 토큰 만료시간 라우터)

7. /logout (로그아웃 라우터)

8. /profile (프로필 라우터)

9. /profile/edit (프로필 수정 라우터)

10. /me (사용자 정보 라우터)

11. /me/edit (사용자 정보 수정 라우터)

12. /:friendId (친구 추가, 삭제 라우터)

13. /:privateRooms (개인 채팅방 조회, 삭제 라우터)

14. /:groupRooms (그룹 채팅방 조회, 추가, 수정, 삭제 라우터)

15. /:privateRooms/:userId (개인 채팅방 상대 정보 조회 라우터)

16. /:groupRooms/:usersId (그룹 채팅방 내의 모든 사용자 정보 조회 라우터)

17. /:privateChats (개인 채팅 조회, 추가 라우터)

18. /:groupChats (그룹 채팅 조회, 추가 라우터)

<br />

### DB

1. users (사용자)

2. privateRooms (개인 채팅방)

3. rooms (그룹 채팅방)

4. privateChats (개인 채팅)

5. groupChats (그룹 채팅) -->
