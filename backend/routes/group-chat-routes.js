const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.post("/createGroupChat", async (req, res) => {
  try {
    const titleData = req.body;

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const newGroupChat = {
      title: titleData.title,
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
    console.error("그룹 채팅방 생성 중 오류 발생:", error.message);
    res.status(500).json({ error: "그룹 채팅방 생성에 실패했습니다." });
  }
});

module.exports = router;
