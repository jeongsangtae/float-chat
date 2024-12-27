const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/groupChats", async (req, res) => {
  try {
    const groupChats = await db
      .getDb()
      .collection("groupChats")
      .find()
      .toArray();

    if (!groupChats) {
      return res.status(404).json({ error: "그룹 채팅방을 찾을 수 없습니다." });
    }

    res.status(200).json({ groupChats });
  } catch (error) {
    console.error("그룹 채팅방 조회 중 오류 발생:", error.message);
    res.status(500).json({ error: "그룹 채팅방 조회에 실패했습니다." });
  }
});

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
    console.error("그룹 채팅방 삭제 중 오류 발생:", error.message);
    res.status(500).json({ error: "그룹 채팅방 삭제에 실패했습니다." });
  }
});

module.exports = router;
