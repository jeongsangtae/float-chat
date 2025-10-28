const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const { accessToken } = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

// 채팅 메시지 조회 라우터
router.get("/chat/:roomId", async (req, res) => {
  try {
    // JWT 토큰을 통해 사용자 인증
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    // MongoDB에서 특정 RoomId에 해당하는 채팅 메시지들을 가져옴
    const messages = await db
      .getDb()
      .collection("chatMessages")
      .find({ roomId })
      .sort({ date: 1 }) // 날짜 기준으로 정렬 (오름차순)
      .toArray();

    const lastReadMessage = await db
      .getDb()
      .collection("lastReadMessages")
      .findOne({ userId: othersData._id, roomId });

    res.status(200).json({
      messages,
      lastReadMessage,
    });
  } catch (error) {
    errorHandler(res, error, "채팅 메시지 조회 중 오류 발생");
  }
});

// 채팅 메시지 추가 라우터
router.post("/chat/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    // 클라이언트에서 보낸 데이터 추출
    const { roomId, message, email, nickname, avatarColor, avatarImageUrl } =
      req.body;

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // 새 메시지 객체 생성
    const newMessage = {
      roomId: new ObjectId(roomId), // MongoDB ObjectId로 변환된 roomId
      email,
      nickname,
      message,
      avatarColor,
      avatarImageUrl,
      date: `${kstDate.getFullYear()}.${(kstDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${kstDate
        .getDate()
        .toString()
        .padStart(2, "0")} ${kstDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${kstDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${kstDate.getSeconds().toString().padStart(2, "0")}`, // 날짜 및 시간을 포맷팅하여 문자열로 저장
    };

    let chatRoom = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(roomId) });

    if (!chatRoom) {
      const directChat = await db
        .getDb()
        .collection("directChats")
        .findOne({ _id: new ObjectId(roomId) });

      if (!directChat) {
        return res.status(404).json({ message: "채팅방을 찾을 수 없습니다." });
      }

      // 다이렉트 채팅방에 참여한 다른 사용자 정보를 저장
      const otherParticipant = directChat.participants.find(
        (participant) => participant._id !== othersData._id.toString()
      );

      // socket.io 관련 내용 구성
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      const socketId = onlineUsers.get(otherParticipant._id);

      // 다이렉트 채팅방에 참여한 사용자 isVisible 내용을 모두 true로 변경
      // 새로운 메시지가 추가될 때 저장되는 날짜가 lastMessageDate에 저장되어 함께 업데이트
      await db
        .getDb()
        .collection("directChats")
        .updateOne(
          { _id: directChat._id },
          {
            $set: {
              "participants.$[].isVisible": true,
              lastMessageDate: newMessage.date,
            },
          }
        );

      // 상대방 isVisible 내용만 true로 변경
      // 위 로직과 결과는 동일함 (두 사용자 모두 true가 됨)
      // await db
      //   .getDb()
      //   .collection("directChats")
      //   .updateOne(
      //     {
      //       _id: directChat._id.toString(),
      //       "participants._id": { $ne: othersData._id.toString() },
      //     }, // 상대방 찾기
      //     { $set: { "participants.$.isVisible": true } }
      //   );

      // 최신화된 다이렉트 채팅방을 조회
      const updatedDirectChat = await db
        .getDb()
        .collection("directChats")
        .findOne({ _id: new ObjectId(roomId) });

      // 저장해 둔 초기 상태를 바탕으로 다이렉트 채팅방이 현재 화면에서 보이지 않는 상대방에게 업데이트된 정보를 전달해 실시간 반영
      if (socketId && otherParticipant.isVisible === false) {
        io.to(socketId).emit("invisibleDirectChat", updatedDirectChat);
      }

      // 이미 보이는 다이렉트 채팅방 업데이트
      if (socketId) {
        io.to(socketId).emit("updatedDirectChat", updatedDirectChat);
      }

      // directChat 데이터를 chatRoom 형식으로 변환
      chatRoom = {
        _id: directChat._id,
        title: "",
        users: directChat.participants.map((participant) => participant._id), // users와 같은 형식으로 변환
      };
    }

    // 새 메시지를 chatMessages 컬렉션에 저장
    await db.getDb().collection("chatMessages").insertOne(newMessage);

    // socket.io를 통해 새 메시지를 해당 채팅방에 브로드캐스트
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const chatRoomId = `room-${roomId}`; // 그룹 채팅방 ID 기반으로 채팅방 생성
    io.to(chatRoomId).emit("newMessage", newMessage); // 해당 채팅방에 메시지 전송

    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴
    const roomUsers = req.app.get("roomUsers");
    const roomSockets = roomUsers.get(chatRoomId);

    // 메시지 보낸 사용자 제외하고, 현재 방에 없는 사용자에게만 알림 전송
    chatRoom.users.forEach((userId) => {
      // 메시지를 전달하는 사용자와 일치하는 사용자는 건너뛰고 전달
      // 메시지를 보낸 사람 제외
      if (userId === othersData._id.toString()) return;

      const socketId = onlineUsers.get(userId);

      // 채팅방에 참여하지 않은 상대방에게 알림을 전달
      if (socketId && !roomSockets.includes(socketId)) {
        io.to(socketId).emit("messageNotification", {
          id: new ObjectId().toString(),
          roomTitle: chatRoom.title,
          senderNickname: othersData.nickname,
          avatarColor: othersData.avatarColor,
          avatarImageUrl: othersData.avatarImageUrl,
          message,
        });
      }
    });

    res.status(200).json({ newMessage });
  } catch (error) {
    errorHandler(res, error, "채팅 메시지 저장 중 오류 발생");
  }
});

// 마지막 메시지 ID 저장 라우터
router.post("/chat/:roomId/lastVisibleMessage", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    // 클라이언트에서 보낸 데이터 추출
    let roomId = req.params.roomId;
    const lastVisibleMessageId = req.body.lastVisibleMessageId;

    roomId = new ObjectId(roomId);

    // console.log(roomId, othersData._id, lastVisibleMessage);

    // let date = new Date();
    // let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // 마지막 메시지 ID 저장
    const lastVisibleMessage = {
      userId: othersData._id,
      roomId,
      lastVisibleMessageId,
    };

    // 마지막 메시지 정보를 lastReadMessages 컬렉션에 저장
    // await db
    //   .getDb()
    //   .collection("lastReadMessages")
    //   .updateOne(
    //     { userId: othersData._id, "rooms.roomId": roomId },
    //     {
    //       $set: {
    //         "rooms.$.lastVisibleMessageId": lastVisibleMessageId,
    //         // updatedAt: new Date(),
    //       },
    //     },
    //     { upsert: true }
    //   );

    await db
      .getDb()
      .collection("lastReadMessages")
      .updateOne(
        {
          userId: lastVisibleMessage.userId,
          roomId: lastVisibleMessage.roomId,
        },
        {
          $set: {
            lastVisibleMessageId: lastVisibleMessage.lastVisibleMessageId,
          },
        },
        { upsert: true }
      );

    res.status(200).json({ lastVisibleMessage });
  } catch (error) {
    errorHandler(res, error, "마지막 메시지 ID 저장 중 오류 발생");
  }
});

module.exports = router;
