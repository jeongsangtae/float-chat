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

router.post("/createGroupChat", async (req, res) => {
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

module.exports = router;
