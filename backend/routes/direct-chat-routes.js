const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const { accessToken } = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

// 다이렉트 채팅방 조회 라우터
router.get("/directChats", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const directChats = await db
      .getDb()
      .collection("directChats")
      .find({ "participants._id": { $in: [othersData._id.toString()] } })
      .toArray();

    if (!directChats.length === 0) {
      return res
        .status(404)
        .json({ error: "다이렉트 채팅방을 찾을 수 없습니다." });
    }

    res.status(200).json({ directChats });
  } catch (error) {
    errorHandler(res, error, "다이렉트 채팅방 조회 중 오류 발생");
  }
});

// 다이렉트 채팅방 추가 라우터
router.post("/directChatForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const friendData = req.body;

    const existingChat = await db
      .getDb()
      .collection("directChats")
      .findOne({
        "participants._id": {
          $all: [othersData._id.toString(), friendData.id],
        },
      });

    if (existingChat) {
      return res.status(200).json({ roomId: existingChat._id });
    }

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const newDirectChat = {
      participants: [
        { _id: othersData._id.toString(), nickname: othersData.nickname }, // 현재 사용자
        { _id: friendData.id, nickname: friendData.nickname }, // 친구
      ],
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

    const result = await db
      .getDb()
      .collection("directChats")
      .insertOne(newDirectChat);

    const roomId = result.insertedId;

    res.status(200).json({ roomId });
  } catch (error) {
    errorHandler(res, error, "다이렉트 채팅방 생성 중 오류 발생");
  }
});

module.exports = router;
