const path = require("path");

const express = require("express");
const dotenv = require("dotenv");

const http = require("http"); // http 모듈 추가
const { Server } = require("socket.io"); // socket.io 추가

const db = require("./data/database");
// const boardRoutes = require("./routes/board-routes");
// const userRoutes = require("./routes/user-routes");
// const adminRoutes = require("./routes/admin-routes");
// const userChatRoutes = require("./routes/user-chat-routes");
// const adminChatRoutes = require("./routes/admin-chat-routes");
const userRoutes = require("./routes/user-routes");
const groupChatRoutes = require("./routes/group-chat-routes");
const friendRoutes = require("./routes/friend-routes");

const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// CORS 미들웨어를 사용해서 연결
// CORS 설정: 클라이언트 애플리케이션에서 서버로 요청을 보낼 때, 다른 도메인 간의 요청을 허용함
let corsURL = process.env.CORS_URL || "http://localhost:5173";

app.use(
  cors({
    origin: corsURL, // 클라이언트 도메인
    credentials: true,
  })
);

// app.use(boardRoutes);
// app.use(userRoutes);
// app.use(adminRoutes);
// app.use(userChatRoutes);
// app.use(adminChatRoutes);
app.use(userRoutes);
app.use(groupChatRoutes);
app.use(friendRoutes);

// 프론트엔드 파일 설정을 추가
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

app.use((req, res, next) => {
  res.status(404).render("404");
});

app.use((error, req, res, next) => {
  console.log(error);
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

// onlineUsers 맵으로 변경
const onlineUsers = new Map(); // userId -> socketId 저장

app.set("onlineUsers", onlineUsers);

// 클라이언트가 Socket.io 연결을 맺을 때 실행되는 이벤트 함수
// Socket.io 설정
io.on("connection", (socket) => {
  console.log("클라이언트가 연결되었습니다:", socket.id);

  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`사용자 온라인: ${userId}, ${socket.id}`);
  });

  // 클라이언트를 특정 방에 참여시킴
  socket.on("joinRoom", (roomId) => {
    const chatRoomId = `room-${roomId}`;
    socket.join(chatRoomId);
    console.log(`방 번호: ${chatRoomId} 입장`);
  });

  // 클라이언트를 특정 방에서 나가게 함 (방장이 방을 삭제하는 것과는 다른 내용)
  // socket.on("leaveRoom", (roomId) => {
  //   const chatRoomId = `room-${roomId}`;
  //   socket.leave(chatRoomId);
  //   console.log(`방 번호: ${chatRoomId} 나감`);
  // });

  // 클라이언트가 연결을 끊었을 때 실행되는 이벤트 함수
  // socket.on("disconnect", () => {
  //   console.log("클라이언트 연결이 끊어졌습니다:", socket.id);
  // });
  socket.on("disconnect", () => {
    console.log("클라이언트 연결이 끊어졌습니다:", socket.id);
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`사용자 오프라인: ${userId}`);
        break;
      }
    }
  });
});

// const friendSocket = io.of("/friends");

// friendSocket.on("connection", (socket) => {
//   console.log("친구 요청 소켓 연결됨:", socket.id);

//   socket.on("sendFriendRequest", ({ senderEmail, receiverEmail }) => {
//     console.log(`친구 요청 from ${senderEmail} to ${receiverEmail}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("친구 요청 소켓 연결 해제:", socket.id);
//   });
// });

// MongoDB에 연결한 후 서버를 시작
// MongoDB 설정
db.connectToDatabase()
  .then(() => {
    // app.listen 대신 server.listen 사용
    server.listen(port, "0.0.0.0", () => {
      console.log(`서버가 실행되었습니다. 포트: ${port}`);
    });
  })
  .catch((error) => {
    console.log("데이터베이스에 연결하지 못했습니다.");
    console.log(error);
  });
