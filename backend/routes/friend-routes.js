const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const { accessToken } = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/friends", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const userId = new ObjectId(othersData._id);

    console.log(userId);

    const friends = await db
      .getDb()
      .collection("friends")
      .find({ $or: [{ "requester.id": userId }, { "receiver.id": userId }] })
      .toArray();

    console.log(friends);

    res.status(200).json({ friends });
  } catch (error) {
    errorHandler(res, error, "친구 목록 조회 중 오류 발생");
  }
});

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
      .find({ $or: [{ requester: userId }, { receiver: userId }] })
      .toArray();

    // console.log(friendRequests);

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
    const searchUser = await db
      .getDb()
      .collection("users")
      .findOne({
        email: { $regex: `^${requestBody.searchUserEmail}$`, $options: "i" },
      });

    if (!searchUser) {
      return res
        .status(404)
        .json({ message: "해당 이메일의 사용자를 찾을 수 없습니다." });
    }

    const requesterId = new ObjectId(requestBody._id); // 요청 보낸 사용자
    const receiverId = new ObjectId(searchUser._id); // 친구 추가할 사용자

    if (requesterId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "본인 계정으로는 친구 요청을 보낼 수 없습니다." });
    }

    // 이미 친구인지 확인
    const existingFriend = await db
      .getDb()
      .collection("friends")
      .findOne({
        $or: [
          { "requester.id": requesterId, "receiver.id": receiverId },
          { "requester.id": receiverId, "receiver.id": requesterId },
        ],
      });

    if (existingFriend) {
      return res.status(400).json({ message: "이미 친구인 사용자입니다." });
    }

    // 이미 친구 요청을 보냈는지 확인
    const existingRequest = await db
      .getDb()
      .collection("friendRequests")
      .findOne({
        $or: [
          { requester: requesterId, receiver: receiverId },
          { requester: receiverId, receiver: requesterId },
        ],
      });

    if (existingRequest) {
      return res.status(400).json({ message: "이미 친구 요청을 보냈습니다." });
    }

    await db
      .getDb()
      .collection("friendRequests")
      .insertOne({
        requester: requesterId,
        requesterNickname: requestBody.nickname,
        receiver: receiverId,
        receiverNickname: searchUser.nickname,
        status: "보류",
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

    // 친구 요청 받은 유저가 온라인 상태인지 확인 후 소켓 알림 보내기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴
    const receiverSocketId = onlineUsers.get(searchUser._id.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequest", {
        id: new ObjectId().toString(),
        requester: requestBody.nickname,
        message: "새로운 친구 요청이 도착했습니다.",
      });
      console.log("친구 요청 알림 전송 완료");
    }

    res.status(200).json({ message: "친구 요청이 전송되었습니다." });
  } catch (error) {
    errorHandler(res, error, "친구 추가 요청 중 오류 발생");
  }
});

router.post("/acceptFriend", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const { friendRequestId } = req.body;

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const friendRequest = await db
      .getDb()
      .collection("friendRequests")
      .findOne({ _id: new ObjectId(friendRequestId) });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ message: "존재하지 않는 친구 요청입니다." });
    }

    // 요청을 보낸 사용자(othersData._id)가 requester인지 receiver인지 판별
    const requesterChecked = othersData._id === friendRequest.requester;
    const otherUserId = requesterChecked
      ? friendRequest.receiver
      : friendRequest.requester; // 상대방 _id 확인

    const acceptFriend = await db
      .getDb()
      .collection("friends")
      .insertOne({
        requester: {
          id: friendRequest.requester,
          nickname: friendRequest.requesterNickname,
        },
        receiver: {
          id: friendRequest.receiver,
          nickname: friendRequest.receiverNickname,
        },
        // user1: friendRequest.requester,
        // user2: friendRequest.receiver,
        status: "수락됨",
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

    await db
      .getDb()
      .collection("friendRequests")
      .deleteOne({ _id: new ObjectId(friendRequestId) });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    const socketId = onlineUsers.get(otherUserId.toString());

    if (socketId) {
      io.to(socketId).emit("acceptFriend", friendRequestId);
    }

    res.status(200).json({ acceptFriend });
  } catch (error) {
    errorHandler(res, error, "친구 요청 수락 중 오류 발생");
  }
});

router.delete("/rejectFriend/:friendRequestId", async (req, res) => {
  try {
    const { friendRequestId } = req.params;

    const result = await db
      .getDb()
      .collection("friendRequests")
      .deleteOne({ _id: new ObjectId(friendRequestId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "삭제할 친구 요청이 없습니다." });
    }

    res.status(200).json({ message: "친구 요청이 삭제되었습니다." });
  } catch (error) {
    errorHandler(res, error, "친구 요청 삭제 중 오류 발생");
  }
});

// 친구 삭제 라우터
router.delete("/deleteFriend/:friendId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const userId = new ObjectId(othersData._id);

    const friendId = new ObjectId(req.params.friendId);

    console.log(userId, friendId);

    await db
      .getDb()
      .collection("groupChatInvites")
      .deleteMany({
        $or: [
          { requester: userId, receiver: friendId },
          { requester: friendId, receiver: userId },
        ],
      });

    const result = await db
      .getDb()
      .collection("friends")
      .deleteOne({
        $or: [
          { "requester.id": userId, "receiver.id": friendId },
          { "requester.id": friendId, "receiver.id": userId },
        ],
      });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "삭제할 친구 데이터가 없습니다." });
    }

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    const socketId = onlineUsers.get(friendId.toString());
    if (socketId) {
      // 친구 삭제 시에 해당 친구와 관련된 그룹 채팅방 초대 목록 삭제를 알리는 이벤트
      io.to(socketId).emit("friendDeleteGroupChatInviteCleanup", {
        userId,
        friendId,
      });

      // 친구 삭제를 알리는 이벤트
      io.to(socketId).emit("friendDelete", {
        userId,
        friendId,
      });
    }

    res.status(200).json({ message: "친구가 삭제되었습니다." });
  } catch (error) {
    errorHandler(res, error, "친구 삭제 중 오류 발생");
  }
});

module.exports = router;
