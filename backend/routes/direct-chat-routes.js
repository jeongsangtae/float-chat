const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const { accessToken } = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/directChats", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    // users 배열에 내 ID가 있는지 확인
    const directChats = await db
      .getDb()
      .collection("directChats")
      .find({ participants: { $in: [othersData._id.toString()] } })
      .toArray();

    console.log(directChats.length, !directChats.length);

    if (!directChats.length) {
      return res
        .status(404)
        .json({ error: "다이렉트 채팅방을 찾을 수 없습니다." });
    }

    res.status(200).json({ directChats });
  } catch (error) {
    errorHandler(res, error, "다이렉트 채팅방 조회 중 오류 발생");
  }
});

router.post("/directChatForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const friendId = req.body.id;

    // 기존 채팅방이 있는지 확인 (countDocuments 사용)
    const existingChat = await db
      .getDb()
      .collection("directChats")
      .findOne({
        participants: { $all: [othersData._id.toString(), friendId] },
      });

    if (existingChat) {
      return res.status(200).json({
        chatId: existingChat._id,
        message: "기존 채팅방 존재",
      });
    }

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const newDirectChat = {
      participants: [othersData._id.toString(), friendId], // 현재 사용자 + 친구
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

    await db.getDb().collection("directChats").insertOne(newDirectChat);

    res.status(200).json({ newDirectChat, message: "다이렉트 채팅방 추가" });
  } catch (error) {
    errorHandler(res, error, "다이렉트 채팅방 생성 중 오류 발생");
  }
});

module.exports = router;
