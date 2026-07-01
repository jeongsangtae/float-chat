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

    // 현재 사용자에게 표시되는 다이렉트 채팅방만 조회
    const directChats = await db
      .getDb()
      .collection("directChats")
      .find({
        participants: {
          $elemMatch: { _id: othersData._id.toString(), isVisible: true },
        },
      })
      .sort({ lastMessageDate: -1 })
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

    // 기존 다이렉트 채팅방이 존재하면 현재 사용자 채팅방 다시 표시
    if (existingChat) {
      await db
        .getDb()
        .collection("directChats")
        .updateOne(
          {
            _id: existingChat._id,
            "participants._id": othersData._id.toString(),
          },
          { $set: { "participants.$.isVisible": true } }
        );

      // 변경된 다이렉트 채팅방 정보 조회
      const updatedExistingChat = await db
        .getDb()
        .collection("directChats")
        .findOne({
          "participants._id": {
            $all: [othersData._id.toString(), friendData.id],
          },
        });

      return res.status(200).json({
        directChat: updatedExistingChat,
        roomId: updatedExistingChat._id,
      });
    }

    // 한국 시간(KST) 기준 생성 시간
    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const formatKSTDate = `${kstDate.getFullYear()}.${(kstDate.getMonth() + 1)
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
      .padStart(2, "0")}:${kstDate.getSeconds().toString().padStart(2, "0")}`;

    // 새로운 다이렉트 채팅방 생성
    const newDirectChat = {
      participants: [
        {
          _id: othersData._id.toString(),
          nickname: othersData.nickname,
          avatarColor: othersData.avatarColor,
          avatarImageUrl: othersData.avatarImageUrl,
          isVisible: true,
        }, // 현재 사용자
        {
          _id: friendData.id,
          nickname: friendData.nickname,
          avatarColor: friendData.avatarColor,
          avatarImageUrl: friendData.avatarImageUrl,
          isVisible: false,
        }, // 친구
      ],
      date: formatKSTDate,
      lastMessageDate: formatKSTDate,
    };

    // 생성된 채팅방 ObjectId 저장
    const result = await db
      .getDb()
      .collection("directChats")
      .insertOne(newDirectChat);

    const roomId = result.insertedId;

    res.status(200).json({ directChat: newDirectChat, roomId });
  } catch (error) {
    errorHandler(res, error, "다이렉트 채팅방 생성 중 오류 발생");
  }
});

// 다이렉트 채팅방 닫기 라우터
router.patch("/closeDirectChat/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    const directChat = await db
      .getDb()
      .collection("directChats")
      .findOne({ _id: roomId });

    if (!directChat) {
      return res
        .status(404)
        .json({ message: "다이렉트 채팅방을 찾을 수 없습니다." });
    }

    // 다이렉트 채팅방 숨김 처리
    await db
      .getDb()
      .collection("directChats")
      .updateOne(
        {
          _id: roomId,
          "participants._id": othersData._id.toString(),
        },
        { $set: { "participants.$.isVisible": false } }
      );

    return res.status(200).json({ message: "다이렉트 채팅방 닫기 성공" });
  } catch (error) {
    errorHandler(res, error, "다이렉트 채팅방 닫기 중 오류 발생");
  }
});

module.exports = router;
