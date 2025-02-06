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
      .find({ email: responseData.email })
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
      email: groupChatData.email,
      username: groupChatData.username,
      nickname: groupChatData.nickname,
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

    // 새 메시지를 chatMessages 컬렉션에 저장
    await db.getDb().collection("chatMessages").insertOne(newMessage);

    // socket.io를 통해 새 메시지를 해당 채팅방에 브로드캐스트
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    // const roomId = `room-${roomId}`; // 사용자 ID 기반으로 채팅방 ID 생성
    const chatRoomId = `room-${roomId}`; // 그룹 채팅방 ID 기반으로 채팅방 생성
    io.to(chatRoomId).emit("newMessage", newMessage); // 해당 채팅방에 메시지 전송

    // console.log(newMessage);
    // console.log("====================");
    // console.log(chatRoomId);
    res.status(200).json({ newMessage });
  } catch (error) {
    errorHandler(res, error, "채팅 메시지 저장 중 오류 발생");
  }
});

module.exports = router;
