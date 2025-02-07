const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const { accessToken } = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/friendRequests", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const userId = new ObjectId(othersData._id);

    const friendRequests = await db
      .getDb()
      .collection("friendRequests")
      .find({ $or: [{ sender: userId }, { receiver: userId }] })
      .toArray();

    console.log(friendRequests);

    res.status(200).json({ friendRequests });
  } catch (error) {
    errorHandler(res, error, "친구 추가 요청 조회 중 오류 발생");
  }
});

router.post("/friendRequests", async (req, res) => {
  try {
    // const othersData = await accessToken(req, res);

    // if (!othersData) {
    //   return res.status(401).json({ message: "jwt error" });
    // }

    // console.log(othersData._id);

    const requestBody = req.body;

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // 친구 추가할 사용자 찾기
    const searchFriend = await db
      .getDb()
      .collection("users")
      .findOne({
        email: { $regex: `^${requestBody.searchUserEmail}$`, $options: "i" },
      });

    if (!searchFriend) {
      return res
        .status(404)
        .json({ message: "해당 이메일의 사용자를 찾을 수 없습니다." });
    }

    const senderId = new ObjectId(requestBody._id); // 요청 보낸 사용자
    const receiverId = new ObjectId(searchFriend._id); // 친구 추가할 사용자

    // 이미 친구 요청을 보냈거나 친구인지 확인
    const existingRequest = await db
      .getDb()
      .collection("friendRequests")
      .findOne({
        sender: senderId,
        receiver: receiverId,
      });

    if (existingRequest) {
      return res.status(400).json({ message: "이미 친구 요청을 보냈습니다." });
    }

    await db
      .getDb()
      .collection("friendRequests")
      .insertOne({
        sender: senderId,
        senderEmail: requestBody.email,
        receiver: receiverId,
        receiverEmail: requestBody.searchUserEmail,
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

    res.status(200).json({ message: "친구 요청이 전송되었습니다." });
  } catch (error) {
    errorHandler(res, error, "친구 추가 요청 중 오류 발생");
  }
});

module.exports = router;
