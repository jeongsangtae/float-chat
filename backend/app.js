const path = require("path");

const express = require("express");
const mongodb = require("mongodb");
const dotenv = require("dotenv");

const http = require("http"); // http 모듈 추가
const { Server } = require("socket.io"); // socket.io 추가

const db = require("./data/database");

const userRoutes = require("./routes/user-routes");
const directChatRoutes = require("./routes/direct-chat-routes");
const groupChatRoutes = require("./routes/group-chat-routes");
const chatRoutes = require("./routes/chat-routes");
const friendRoutes = require("./routes/friend-routes");

const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const ObjectId = mongodb.ObjectId;

// 환경 변수 로드
dotenv.config();

// 서버 포트 설정
const port = process.env.PORT || 3000;

// JSON 요청 본문 파싱
app.use(express.json());

// 쿠키 파싱 미들웨어
app.use(cookieParser());

// CORS 설정 (클라이언트 도메인에서의 요청 허용)
let corsURL = process.env.CORS_URL || "http://localhost:5173";

app.use(
  cors({
    origin: corsURL, // 클라이언트 도메인
    credentials: true,
  })
);

// 라우터 등록
app.use(userRoutes);
app.use(directChatRoutes);
app.use(groupChatRoutes);
app.use(chatRoutes);
app.use(friendRoutes);

// 빌드된 프론트엔드 정적 파일 제공
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

// SPA 라우팅을 위해 모든 요청을 index.html로 전달
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

// 존재하지 않는 경로 처리
app.use((req, res, next) => {
  res.status(404).render("404");
});

// 전역 서버 오류 처리
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render("500");
});

// 서버 설정
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsURL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io 객체를 Express 앱 객체에 저장하여 라우트 함수에서도 접근할 수 있도록 함
app.set("io", io);

// userId와 socket.id를 매핑하여 온라인 사용자 관리
const onlineUsers = new Map(); // userId -> socketId 저장

// 채팅방별 socket.id 목록 관리
const roomUsers = new Map(); // roomId -> socketId 저장

// 온라인 사용자 정보를 저장하여 라우트에서도 사용할 수 있도록 함
app.set("onlineUsers", onlineUsers);

// 채팅방 참여 사용자 정보를 저장하여 라우트에서도 사용할 수 있도록 함
app.set("roomUsers", roomUsers);

// Socket.io 연결 이벤트
io.on("connection", (socket) => {
  socket.on("registerUser", async (userId) => {
    // 로그인한 사용자의 socket.id 등록
    onlineUsers.set(userId, socket.id);

    // 친구 목록 조회
    const friends = await db
      .getDb()
      .collection("friends")
      .find({
        $or: [
          { "requester.id": new ObjectId(userId) },
          { "receiver.id": new ObjectId(userId) },
        ],
      })
      .toArray();

    // 온라인 상태인 친구들에게 접속 알림 전송
    friends.forEach((friend) => {
      const friendId =
        friend.requester.id.toString() === userId.toString()
          ? friend.receiver.id.toString()
          : friend.requester.id.toString();

      const friendSocketId = onlineUsers.get(friendId);

      if (friendSocketId) {
        io.to(friendSocketId).emit("onlineFriend", friend);
      }
    });

    // 참여 중인 그룹 채팅방 조회
    const groupChats = await db
      .getDb()
      .collection("groupChats")
      .find({ users: userId })
      .toArray();

    for (const groupChat of groupChats) {
      // 그룹 채팅방 참여자 목록
      const participants = groupChat.users;

      // 현재 온라인인 참여자만 추출
      const onlineParticipantIds = participants.filter((participant) =>
        // participant !== userId && onlineUsers.has(participant)
        onlineUsers.has(participant)
      );

      for (const onlineParticipantId of onlineParticipantIds) {
        const onlineParticipantSocketId = onlineUsers.get(onlineParticipantId);

        if (onlineParticipantSocketId) {
          // 그룹 채팅방 참여자들에게 온라인 상태 변경 알림
          io.to(onlineParticipantSocketId).emit("onlineGroupChatUser", {
            onlineGroupChatUser: {
              _id: userId,
              onlineChecked: true,
            },
          });
        }
      }
    }
  });

  // 클라이언트를 특정 방에서 나가게 함 (방장이 방을 삭제하는 것과는 다른 내용)
  // 사용자가 다른 채팅방으로 이동할 때 이전 채팅방 나가는 동작
  socket.on("leaveRoom", (roomId) => {
    // Socket.io 방 이름 생성
    const chatRoomId = `room-${roomId}`;

    // Socket.io 채팅방에서 나가기
    socket.leave(chatRoomId);

    // // roomUsers에서 현재 사용자의 socket.id 제거
    if (roomUsers.has(chatRoomId)) {
      roomUsers.set(
        chatRoomId,
        roomUsers.get(chatRoomId).filter((id) => id !== socket.id)
      );
    }
  });

  // 클라이언트를 특정 방에 참여시킴
  socket.on("joinRoom", async (roomId) => {
    // Socket.io 방 이름 생성
    const chatRoomId = `room-${roomId}`;

    // Socket.io 채팅방 참여
    socket.join(chatRoomId);

    // 현재 방에 있는 사용자 목록을 저장 (방에 사용자 추가)
    if (!roomUsers.has(chatRoomId)) {
      roomUsers.set(chatRoomId, []); // 방에 해당하는 배열이 없으면 새로 생성
    }

    // roomUsers에 현재 사용자 socket.id 저장
    roomUsers.get(chatRoomId).push(socket.id);
  });

  // 클라이언트가 연결을 끊었을 때 실행되는 이벤트
  socket.on("disconnect", async () => {
    // 연결이 끊긴 소켓 ID를 가진 userId를 찾음
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId); // 온라인 사용자 목록에서 제거

        // 친구 목록을 DB에서 조회
        const friends = await db
          .getDb()
          .collection("friends")
          .find({
            $or: [
              { "requester.id": new ObjectId(userId) },
              { "receiver.id": new ObjectId(userId) },
            ],
          })
          .toArray();

        // 친구들에게 offline 신호 전송
        friends.forEach((friend) => {
          const friendId =
            friend.requester.id.toString() === userId.toString()
              ? friend.receiver.id.toString()
              : friend.requester.id.toString();

          const friendSocketId = onlineUsers.get(friendId);

          if (friendSocketId) {
            io.to(friendSocketId).emit("offlineFriend", friend);
          }
        });

        // 참여 중인 그룹 채팅방 조회
        const groupChats = await db
          .getDb()
          .collection("groupChats")
          .find({ users: userId })
          .toArray();

        for (const groupChat of groupChats) {
          // 그룹 채팅방 참여자 목록
          const participants = groupChat.users;

          // 현재 온라인인 참여자만 추출
          const onlineParticipantIds = participants.filter((participant) =>
            // participant !== userId && onlineUsers.has(participant)
            onlineUsers.has(participant)
          );

          for (const onlineParticipantId of onlineParticipantIds) {
            const onlineParticipantSocketId =
              onlineUsers.get(onlineParticipantId);

            if (onlineParticipantSocketId) {
              // 그룹 채팅방 참여자들에게 오프라인 상태 변경 알림
              io.to(onlineParticipantSocketId).emit("offlineGroupChatUser", {
                offlineGroupChatUser: {
                  _id: userId,
                  onlineChecked: false,
                },
              });
            }
          }
        }
      }
    }
  });
});

// MongoDB 연결 후 서버 실행
db.connectToDatabase()
  .then(() => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`서버가 실행되었습니다. 포트: ${port}`);
    });
  })
  .catch((error) => {
    console.error("데이터베이스에 연결 실패:", error);
  });
