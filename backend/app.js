const path = require("path");

const express = require("express");
const mongodb = require("mongodb");
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
const directChatRoutes = require("./routes/direct-chat-routes");
const groupChatRoutes = require("./routes/group-chat-routes");
const chatRoutes = require("./routes/chat-routes");
const friendRoutes = require("./routes/friend-routes");

const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const ObjectId = mongodb.ObjectId;

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
app.use(directChatRoutes);
app.use(groupChatRoutes);
app.use(chatRoutes);
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

const roomUsers = new Map(); // roomId -> socketId 저장

app.set("onlineUsers", onlineUsers);

app.set("roomUsers", roomUsers);

// 클라이언트가 Socket.io 연결을 맺을 때 실행되는 이벤트 함수
// Socket.io 설정
io.on("connection", (socket) => {
  console.log("클라이언트가 연결되었습니다:", socket.id);

  socket.on("registerUser", async (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`사용자 온라인: ${userId}, ${socket.id}`);

    // let userId = new ObjectId(userId);

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

    // 참여한 그룹 채팅방 조회
    const groupChats = await db
      .getDb()
      .collection("groupChats")
      .find({ users: userId })
      .toArray();

    for (const groupChat of groupChats) {
      const participants = groupChat.users;

      // 온라인 상태의 참여자만 필터링
      const onlineParticipantIds = participants.filter(
        (participant) => participant !== userId && onlineUsers.has(participant)
      );

      console.log("온라인 상태의 참여자: ", onlineParticipantIds);

      for (const onlineParticipantId of onlineParticipantIds) {
        const currentUserInfo = await db
          .getDb()
          .collection("users")
          .findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
          );

        console.log("온라인 참여자 정보: ", currentUserInfo);

        const onlineParticipantSocketId = onlineUsers.get(onlineParticipantId);

        if (onlineParticipantSocketId) {
          io.to(onlineParticipantSocketId).emit("onlineGroupChatUser", {
            onlineGroupChatUser: {
              ...currentUserInfo,
              onlineChecked: true,
            },
          });
        }
      }
    }
  });

  socket.on("leaveRoom", (roomId) => {
    const chatRoomId = `room-${roomId}`;
    socket.leave(chatRoomId);

    // 그룹 채팅방을 떠날 때 자동으로 roomUsers 목록에서 사용자 socket.id 제거
    // roomUsers에서 해당 사용자의 socketId 제거
    if (roomUsers.has(chatRoomId)) {
      roomUsers.set(
        chatRoomId,
        roomUsers.get(chatRoomId).filter((id) => id !== socket.id)
      );
    }

    console.log(`사용자가 방 나감: ${chatRoomId}`);
  });

  // 클라이언트를 특정 방에 참여시킴
  socket.on("joinRoom", async (roomId) => {
    const chatRoomId = `room-${roomId}`;
    socket.join(chatRoomId);

    // 현재 방에 있는 사용자 목록을 저장 (방에 사용자 추가)
    if (!roomUsers.has(chatRoomId)) {
      roomUsers.set(chatRoomId, []); // 방에 해당하는 배열이 없으면 새로 생성
    }

    roomUsers.get(chatRoomId).push(socket.id); // 해당 방에 사용자 소켓 ID 추가

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
  socket.on("disconnect", async () => {
    console.log("클라이언트 연결이 끊어졌습니다:", socket.id);

    // 연결이 끊긴 소켓 ID를 가진 userId를 찾음
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId); // onlineUsers Map에서 삭제

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

        // const groupChats = await db.getDb().collection("groupChats").find({users: userId}).toArray()

        // for (const groupChat of groupChats ) {

        // }
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
