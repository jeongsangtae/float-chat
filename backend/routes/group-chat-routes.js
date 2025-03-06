const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const { accessToken } = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/groupChats", async (req, res) => {
  const responseData = await accessToken(req, res);

  try {
    const groupChats = await db
      .getDb()
      .collection("groupChats")
      .find({ hostEmail: responseData.email })
      .toArray();

    if (!groupChats) {
      return res.status(404).json({ error: "그룹 채팅방을 찾을 수 없습니다." });
    }

    res.status(200).json({ groupChats });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 조회 중 오류 발생");
  }
});

router.post("/groupChatForm", async (req, res) => {
  try {
    const groupChatData = req.body;

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const newGroupChat = {
      title: groupChatData.title,
      hostId: groupChatData._id,
      hostEmail: groupChatData.email,
      hostUsername: groupChatData.username,
      hostNickname: groupChatData.nickname,
      date: `${kstDate.getFullYear()}.${(kstDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${kstDate
        .getDate()
        .toString()
        .padStart(2, "0")} ${kstDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${kstDate.getSeconds().toString().padStart(2, "0")}`,
      users: [groupChatData._id],
    };

    await db.getDb().collection("groupChats").insertOne(newGroupChat);

    res.status(200).json({ newGroupChat });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 생성 중 오류 발생");
  }
});

router.patch("/groupChatForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const groupChatData = req.body;

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(groupChatData.modalData._id) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    if (groupChat.email !== othersData.email) {
      return res
        .status(403)
        .json({ message: "그룹 채팅방을 수정할 권한이 없습니다." });
    }

    const editGroupChat = {
      _id: new ObjectId(groupChatData.modalData._id),
      title: groupChatData.title,
      date: `${kstDate.getFullYear()}.${(kstDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${kstDate
        .getDate()
        .toString()
        .padStart(2, "0")} ${kstDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${kstDate.getSeconds().toString().padStart(2, "0")}`,
    };

    // console.log(editGroupChat);

    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: new ObjectId(groupChatData.modalData._id) },
        { $set: editGroupChat }
      );

    res.status(200).json({ editGroupChat });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 수정 중 오류 발생");
  }
});

router.delete("/groupChat/:roomId", async (req, res) => {
  console.log(req.params.roomId);

  try {
    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    // 데이터베이스에서 해당 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    console.log(groupChat);

    await db.getDb().collection("groupChats").deleteOne({ _id: roomId });

    res.status(200).json({ message: "그룹 채팅방 삭제 성공" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 삭제 중 오류 발생");
  }
});

router.get("/groupChat/:roomId/users", async (req, res) => {});

router.get("/groupChat/invites", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const userId = new ObjectId(othersData._id);

    const groupChatInvites = await db
      .getDb()
      .collection("groupChatInvites")
      .find({ $or: [{ requester: userId }, { receiver: userId }] })
      .toArray();

    res.status(200).json({ groupChatInvites });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 초대 목록 조회 중 오류 발생");
  }
});

router.post("/groupChat/:roomId/invite", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    console.log(req.body.friendId, req.body.nickname);

    const { friendId, nickname } = req.body;

    const requesterId = new ObjectId(othersData._id); // 요청 보낸 사용자
    const receiverId = new ObjectId(friendId); // 그룹 채팅방에 초대할 사용자

    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    if (!groupChat.users.includes(requesterId.toString())) {
      return res.status(403).json({
        message: "그룹 채팅방에 참여한 사용자가 아니므로 초대할 수 없습니다.",
      });
    }

    await db
      .getDb()
      .collection("groupChatInvites")
      .insertOne({
        roomTitle: groupChat.title,
        requester: requesterId,
        requesterNickname: othersData.nickname,
        receiver: receiverId,
        receiverNickname: nickname,
        status: "보류 중",
        date: `${kstDate.getFullYear()}.${(kstDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}.${kstDate
          .getDate()
          .toString()
          .padStart(2, "0")} ${kstDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${kstDate
          .getSeconds()
          .toString()
          .padStart(2, "0")}`,
      });

    // 그룹 채팅방 요청을 받은 유저가 온라인 상태인지 확인 후 소켓 알림 보내기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴
    const receiverSocketId = onlineUsers.get(friendId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("groupChatInviteNotification", {
        id: new ObjectId().toString(),
        roomTitle: groupChat.title,
        message: "새로운 그룹 채팅방 초대 요청이 도착했습니다.",
      });
      console.log("그룹 채팅방 초대 요청 알림 전송 완료");
    }

    return res.status(200).json({ message: "그룹 채팅방 초대 성공" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 초대 중 오류 발생");
  }
});

// 사용자의 채팅 메시지를 가져오는 라우터
router.get("/chat/:roomId", async (req, res) => {
  try {
    // JWT 토큰을 통해 사용자 인증
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    let roomId = req.params.roomId;

    // console.log(roomId, "1");

    roomId = new ObjectId(roomId);

    // MongoDB에서 특정 RoomId에 해당하는 채팅 메시지들을 가져옴
    const messages = await db
      .getDb()
      .collection("chatMessages")
      .find({ roomId })
      .sort({ date: 1 }) // 날짜 기준으로 정렬 (오름차순)
      .toArray();

    res.status(200).json({ messages });
  } catch (error) {
    errorHandler(res, error, "채팅 메시지 조회 중 오류 발생");
  }
});

// 사용자가 입력한 채팅 메시지를 저장하는 라우터
router.post("/chat/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    // 클라이언트에서 보낸 데이터 추출
    const { roomId, message, email } = req.body;

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // 새 메시지 객체 생성
    const newMessage = {
      roomId: new ObjectId(roomId), // MongoDB ObjectId로 변환된 roomId
      email,
      message,
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

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(roomId) });

    // 새 메시지를 chatMessages 컬렉션에 저장
    await db.getDb().collection("chatMessages").insertOne(newMessage);

    // socket.io를 통해 새 메시지를 해당 채팅방에 브로드캐스트
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const chatRoomId = `room-${roomId}`; // 그룹 채팅방 ID 기반으로 채팅방 생성
    io.to(chatRoomId).emit("newMessage", newMessage); // 해당 채팅방에 메시지 전송

    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴
    const roomUsers = req.app.get("roomUsers");
    const roomSockets = roomUsers.get(chatRoomId);

    console.log(roomSockets);

    if (roomSockets) {
      roomSockets.forEach((socketId) => {
        io.to(socketId).emit("messageNotification", {
          id: new ObjectId().toString(),
          roomTitle: groupChat.title,
          message: "새로운 메시지가 추가되었습니다.",
        });
      });
      console.log("새로운 메시지 알림 전송 완료");
    }

    // if (joinRoomUsers) {
    //   io.to(joinRoomUsers).emit("messageNotification", {
    //     id: new ObjectId().toString(),
    //     roomTitle: groupChat.title,
    //     message: "새로운 메시지가 추가되었습니다.",
    //   });
    //   console.log("새로운 메시지 알림 전송 완료");
    // }
    // console.log(newMessage);
    // console.log("====================");
    // console.log(chatRoomId);
    res.status(200).json({ newMessage });
  } catch (error) {
    errorHandler(res, error, "채팅 메시지 저장 중 오류 발생");
  }
});

module.exports = router;
