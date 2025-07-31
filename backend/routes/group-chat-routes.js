const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const { accessToken } = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

// 그룹 채팅방 목록 조회 라우터
router.get("/groupChats", async (req, res) => {
  const othersData = await accessToken(req, res);

  try {
    // users 배열에 내 ID가 있는지 확인
    const groupChats = await db
      .getDb()
      .collection("groupChats")
      .find({ users: { $in: [othersData._id.toString()] } })
      .toArray();

    if (!groupChats.length === 0) {
      return res.status(404).json({ error: "그룹 채팅방을 찾을 수 없습니다." });
    }

    res.status(200).json({ groupChats });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 조회 중 오류 발생");
  }
});

// 그룹 채팅방 참여한 사용자 목록 조회 라우터
router.get("/groupChat/:roomId/users", async (req, res) => {
  try {
    const { roomId } = req.params;

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(roomId) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    const userIds = groupChat ? groupChat.users : [];

    const groupChatUsers = await db
      .getDb()
      .collection("users")
      .find(
        {
          _id: { $in: userIds.map((id) => new ObjectId(id)) },
        },
        { projection: { password: 0 } } // 패스워드 필드 제외
      )
      .toArray();

    const onlineUsers = req.app.get("onlineUsers");

    const groupChatUsersOnlineChecked = groupChatUsers.map((groupChatUser) => ({
      ...groupChatUser,
      onlineChecked: onlineUsers.has(groupChatUser._id.toString()),
    }));

    console.log("그룹 채팅방에 참여한 사용자 목록", groupChatUsers);
    console.log(
      "그룹 채팅방에 참여한 사용자 온라인 유무",
      groupChatUsersOnlineChecked
    );

    res.status(200).json({ groupChatUsers: groupChatUsersOnlineChecked });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 참여자 조회 중 오류 발생");
  }
});

// 그룹 채팅방 추가 라우터
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
      hostAvatarColor: groupChatData.avatarColor,
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
        .padStart(2, "0")}:${kstDate.getSeconds().toString().padStart(2, "0")}`,
      users: [groupChatData._id],
    };

    await db.getDb().collection("groupChats").insertOne(newGroupChat);

    res.status(200).json({ newGroupChat });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 생성 중 오류 발생");
  }
});

// 그룹 채팅방 수정 라우터
router.patch("/groupChatForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const groupChatData = req.body;

    // let date = new Date();
    // let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(groupChatData.modalData._id) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // 로그인한 사용자 이메일이 아닌, 프론트엔드에서 전달한 이메일 정보를 사용하는 것이 좋은가 ?
    if (groupChat.hostEmail !== othersData.email) {
      return res
        .status(403)
        .json({ message: "그룹 채팅방을 수정할 권한이 없습니다." });
    }

    const editGroupChat = {
      _id: new ObjectId(groupChatData.modalData._id),
      title: groupChatData.title,
    };

    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: new ObjectId(groupChatData.modalData._id) },
        { $set: { title: editGroupChat.title } }
      );

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((userId) => {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("groupChatEdit", editGroupChat);
      }
    });

    res.status(200).json({ editGroupChat });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 수정 중 오류 발생");
  }
});

// 그룹 채팅방 삭제 라우터
router.delete("/groupChat/:roomId", async (req, res) => {
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

    console.log("삭제할 그룹 채팅방:", groupChat);

    await db.getDb().collection("chatMessages").deleteMany({ roomId });

    await db.getDb().collection("groupChatInvites").deleteMany({ roomId });

    await db.getDb().collection("groupChats").deleteOne({ _id: roomId });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((userId) => {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("groupChatDeleteInvitesDelete", roomId);
        io.to(socketId).emit("groupChatDelete", roomId);
      }
    });

    res.status(200).json({ message: "그룹 채팅방 삭제 성공", roomId });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 삭제 중 오류 발생");
  }
});

// 그룹 채팅방 나가기 라우터
router.delete("/leaveGroupChat/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    console.log("나갈 그룹 채팅방:", groupChat);

    console.log(othersData._id);

    // users 배열에서 로그인한 사용자 ID 제거
    const updatedUsers = groupChat.users.filter(
      (userId) => userId !== othersData._id.toString()
    );

    await db
      .getDb()
      .collection("groupChats")
      .updateOne({ _id: roomId }, { $set: { users: updatedUsers } });

    await db
      .getDb()
      .collection("groupChatInvites")
      .deleteMany({
        roomId,
        $or: [{ receiver: othersData._id }, { requester: othersData._id }],
      });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    updatedUsers.forEach((userId) => {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("groupChatLeaveInvitesDelete", {
          userId: othersData._id.toString(),
          roomId,
        });
        io.to(socketId).emit("groupChatLeave", othersData._id.toString());
      }
    });

    return res.status(200).json({ message: "그룹 채팅방 나가기 성공" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 나가기 중 오류 발생");
  }
});

// 그룹 채팅방 초대 목록 조회 라우터
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

// 그룹 채팅방 초대 라우터
router.post("/groupChat/:roomId/invite", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

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

    const groupChatParticipant = groupChat.users.some(
      (userId) => userId === receiverId.toString()
    );

    // console.log(groupChatParticipant ? "참여중" : "미참여");

    const newGroupChatInvite = {
      roomId: groupChat._id,
      roomTitle: groupChat.title,
      requester: requesterId,
      requesterNickname: othersData.nickname,
      receiver: receiverId,
      receiverNickname: nickname,
      status: groupChatParticipant ? "참여중" : "보류",
      participantCount: groupChat.users.length,
      avatarColor: othersData.avatarColor,
      date,
      kstDate: `${kstDate.getFullYear()}.${(kstDate.getMonth() + 1)
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
        .padStart(2, "0")}:${kstDate.getSeconds().toString().padStart(2, "0")}`,
    };

    await db
      .getDb()
      .collection("groupChatInvites")
      .insertOne(newGroupChatInvite);

    // 그룹 채팅방 요청을 받은 유저가 온라인 상태인지 확인 후 소켓 알림 보내기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴
    const receiverSocketId = onlineUsers.get(friendId.toString());

    console.log(newGroupChatInvite);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("groupChatInviteNotification", {
        id: new ObjectId().toString(),
        roomTitle: groupChat.title,
        senderNickname: othersData.nickname,
        avatarColor: othersData.avatarColor,
        message: "그룹 채팅방 초대",
      });

      // 그룹 채팅방 초대 정보를 socket으로 전달
      io.to(receiverSocketId).emit("groupChatInvite", newGroupChatInvite);
      console.log("그룹 채팅방 초대 요청 알림 전송 완료");
    }

    return res.status(200).json({ message: "그룹 채팅방 초대 성공" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 초대 중 오류 발생");
  }
});

// 그룹 채팅방 초대 수락 라우터
router.post("/acceptGroupChat", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const { groupChatId, groupChatInviteId } = req.body;

    const groupChatInvite = await db
      .getDb()
      .collection("groupChatInvites")
      .findOne({ _id: new ObjectId(groupChatInviteId) });

    if (!groupChatInvite) {
      return res
        .status(404)
        .json({ message: "존재하지 않는 그룹 채팅방 초대 요청입니다." });
    }

    // 중복된 사용자 _id를 추가하지 않음
    const acceptGroupChat = await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: new ObjectId(groupChatId) },
        { $addToSet: { users: othersData._id.toString() } }
      );

    await db
      .getDb()
      .collection("groupChatInvites")
      .deleteOne({ _id: new ObjectId(groupChatInviteId) });

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(groupChatId) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((userId) => {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("acceptGroupChat", {
          _id: othersData._id,
          email: othersData.email,
          nickname: othersData.nickname,
          username: othersData.username,
          avatarColor: othersData.avatarColor,
        });
      }
    });

    // 클릭한 사용자(othersData._id)가 requester인지 receiver인지 판별
    const requesterChecked =
      othersData._id.toString() === groupChatInvite.requester.toString();

    const otherUserId = requesterChecked
      ? groupChatInvite.receiver
      : groupChatInvite.requester;

    const socketId = onlineUsers.get(otherUserId.toString());

    if (socketId) {
      io.to(socketId).emit("acceptGroupChatInvite", groupChatInviteId);
    }

    res.status(200).json({ acceptGroupChat });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 초대 수락 중 오류 발생");
  }
});

// 그룹 채팅방 초대 거절 라우터
router.delete("/rejectGroupChat/:groupChatInviteId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const { groupChatInviteId } = req.params;

    const groupChatInvite = await db
      .getDb()
      .collection("groupChatInvites")
      .findOne({ _id: new ObjectId(groupChatInviteId) });

    // 클릭한 사용자(othersData._id)가 requester인지 receiver인지 판별
    const requesterChecked =
      othersData._id.toString() === groupChatInvite.requester.toString();

    const otherUserId = requesterChecked
      ? groupChatInvite.receiver
      : groupChatInvite.requester;

    const result = await db
      .getDb()
      .collection("groupChatInvites")
      .deleteOne({ _id: new ObjectId(groupChatInviteId) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "거절할 그룹 채팅방 초대 요청이 없습니다." });
    }

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    const socketId = onlineUsers.get(otherUserId.toString());

    if (socketId) {
      io.to(socketId).emit("rejectGroupChatInvite", groupChatInviteId);
    }

    res
      .status(200)
      .json({ message: "그룹 채팅방 초대 요청이 거절되었습니다." });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 초대 거절 중 오류 발생");
  }
});

module.exports = router;
