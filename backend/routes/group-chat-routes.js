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

  if (!othersData) {
    return res.status(401).json({ message: "jwt error" });
  }

  try {
    // 로그인한 사용자가 참여 중인 그룹 채팅방 조회
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

    // 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(roomId) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // 그룹 채팅방 참여자 ID 목록
    const userIds = groupChat ? groupChat.users : [];

    // 그룹 채팅방에 참여한 사용자 조회
    const groupChatUsers = await db
      .getDb()
      .collection("users")
      .find(
        {
          _id: { $in: userIds.map((id) => new ObjectId(id)) },
        },
        { projection: { password: 0 } } // 비밀번호는 응답에서 제외
      )
      .toArray();

    const onlineUsers = req.app.get("onlineUsers");

    // 사용자별 온라인 여부 추가
    const groupChatUsersOnlineChecked = groupChatUsers.map((groupChatUser) => ({
      ...groupChatUser,
      onlineChecked: onlineUsers.has(groupChatUser._id.toString()),
    }));

    res.status(200).json({ groupChatUsers: groupChatUsersOnlineChecked });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 참여자 조회 중 오류 발생");
  }
});

// 그룹 채팅방 추가 라우터
router.post("/groupChatForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    let hostId = othersData._id.toString();

    const groupChatData = req.body;

    // 한국 시간(KST) 기준 생성 시간
    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // 새로운 그룹 채팅방 정보 저장
    const newGroupChat = {
      title: groupChatData.title,
      hostId: hostId,
      hostEmail: othersData.email,
      hostUsername: othersData.username,
      hostNickname: othersData.nickname,
      hostAvatarColor: othersData.avatarColor,
      hostAvatarImageUrl: othersData.avatarImageUrl,
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
      users: [hostId],
    };

    // 그룹 채팅방 저장
    const result = await db
      .getDb()
      .collection("groupChats")
      .insertOne(newGroupChat);

    // groupChatOrder에 저장하기 위해 문자열로 변환
    const groupChatId = result.insertedId.toString();

    // 사용자의 그룹 채팅방 순서 목록에 새 채팅방 추가
    await db
      .getDb()
      .collection("users")
      .updateOne(
        { _id: othersData._id },
        { $push: { groupChatOrder: groupChatId } }
      );

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

    const requestBody = req.body;

    // 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(requestBody.modalData._id) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // 그룹 채팅방 수정 권한 확인
    if (groupChat.hostEmail !== othersData.email) {
      return res
        .status(403)
        .json({ message: "그룹 채팅방을 수정할 권한이 없습니다." });
    }

    // 수정할 그룹 채팅방 정보
    const editGroupChat = {
      _id: new ObjectId(requestBody.modalData._id),
      title: requestBody.title,
    };

    // 그룹 채팅방 제목 업데이트
    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: new ObjectId(requestBody.modalData._id) },
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

// 그룹 채팅방 공지 수정 라우터
router.patch("/groupChatAnnouncementForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const requestBody = req.body;

    // 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(requestBody.modalData.groupChatId) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // 그룹 채팅방 공지 수정 권한 확인
    if (groupChat.hostEmail !== othersData.email) {
      return res
        .status(403)
        .json({ message: "그룹 채팅방 공지사항을 수정할 권한이 없습니다." });
    }

    // 수정할 그룹 채팅방 공지사항 정보
    const editGroupChatAnnouncement = {
      _id: new ObjectId(requestBody.modalData.groupChatId),
      announcement: requestBody.trimmedAnnouncement,
    };

    // 그룹 채팅방 공지사항 업데이트
    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: new ObjectId(requestBody.modalData.groupChatId) },
        { $set: { announcement: editGroupChatAnnouncement.announcement } }
      );

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((userId) => {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit(
          "groupChatAnnouncementEdit",
          editGroupChatAnnouncement
        );
      }
    });

    res.status(200).json({ message: "그룹 채팅방 공지 수정 완료" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 공지 수정 중 오류 발생");
  }
});

// 그룹 채팅방 공지 삭제 라우터
router.patch("/groupChatAnnouncementDelete", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const requestBody = req.body;

    // 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: new ObjectId(requestBody.modalData.groupChatId) });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // 그룹 채팅방 공지 삭제 권한 확인
    if (groupChat.hostEmail !== othersData.email) {
      return res
        .status(403)
        .json({ message: "그룹 채팅방 공지사항을 삭제할 권한이 없습니다." });
    }

    // 공지사항 삭제를 위한 데이터
    const deleteGroupChatAnnouncement = {
      _id: new ObjectId(requestBody.modalData.groupChatId),
      announcement: requestBody.announcement,
    };

    // 그룹 채팅방 공지사항 삭제
    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: new ObjectId(requestBody.modalData.groupChatId) },
        { $set: { announcement: deleteGroupChatAnnouncement.announcement } }
      );

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((userId) => {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit(
          "groupChatAnnouncementDelete",
          deleteGroupChatAnnouncement
        );
      }
    });

    res.status(200).json({ message: "그룹 채팅방 공지 삭제" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 공지 삭제 중 오류 발생");
  }
});

// 그룹 채팅방 삭제 라우터
router.delete("/groupChat/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    // 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // 그룹 채팅방에 저장된 채팅 목록 삭제
    await db.getDb().collection("chatMessages").deleteMany({ roomId });

    // 그룹 채팅방 초대 목록 삭제
    await db.getDb().collection("groupChatInvites").deleteMany({ roomId });

    // 마지막으로 읽은 메시지 정보 삭제
    await db.getDb().collection("lastReadMessages").deleteMany({ roomId });

    // 사용자의 그룹 채팅방 순서 목록에서 삭제
    await db
      .getDb()
      .collection("users")
      .updateMany(
        {
          _id: { $in: groupChat.users.map((id) => new ObjectId(id)) },
        },
        { $pull: { groupChatOrder: roomId.toString() } }
      );

    // 그룹 채팅방 정보 삭제
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

    // 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // users 배열에서 로그인한 사용자 ID 제거
    const updatedUsers = groupChat.users.filter(
      (userId) => userId !== othersData._id.toString()
    );

    // 그룹 채팅방에 참여한 사용자 목록 업데이트
    await db
      .getDb()
      .collection("groupChats")
      .updateOne({ _id: roomId }, { $set: { users: updatedUsers } });

    // 그룹 채팅방 초대 목록 제거
    await db
      .getDb()
      .collection("groupChatInvites")
      .deleteMany({
        roomId,
        $or: [{ receiver: othersData._id }, { requester: othersData._id }],
      });

    // 사용자의 그룹 채팅방 순서 목록에서 삭제
    await db
      .getDb()
      .collection("users")
      .updateOne(
        { _id: othersData._id },
        { $pull: { groupChatOrder: roomId.toString() } }
      );

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

    // 그룹 채팅방 초대 목록 조회
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

    // 한국 시간(KST) 기준 생성 시간
    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // 그룹 채팅방 조회
    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "그룹 채팅방을 찾을 수 없습니다." });
    }

    // 그룹 채팅방 참여 여부 확인
    if (!groupChat.users.includes(requesterId.toString())) {
      return res.status(403).json({
        message: "그룹 채팅방에 참여한 사용자가 아니므로 초대할 수 없습니다.",
      });
    }

    // 초대할 사용자가 이미 참여 중인지 확인
    const groupChatParticipant = groupChat.users.some(
      (userId) => userId === receiverId.toString()
    );

    // 그룹 채팅방 초대 정보 저장
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
      avatarImageUrl: othersData.avatarImageUrl,
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

    // 그룹 채팅방 초대 저장
    await db
      .getDb()
      .collection("groupChatInvites")
      .insertOne(newGroupChatInvite);

    // 초대받은 사용자가 온라인 상태인 경우 실시간 알림 전송
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴
    const receiverSocketId = onlineUsers.get(friendId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("groupChatInviteNotification", {
        id: new ObjectId().toString(),
        roomTitle: groupChat.title,
        senderNickname: othersData.nickname,
        avatarColor: othersData.avatarColor,
        avatarImageUrl: othersData.avatarImageUrl,
        message: "그룹 채팅방 초대",
      });

      // 그룹 채팅방 초대 정보 실시간 전달
      io.to(receiverSocketId).emit("groupChatInvite", newGroupChatInvite);
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

    // 그룹 채팅방 초대 조회
    const groupChatInvite = await db
      .getDb()
      .collection("groupChatInvites")
      .findOne({ _id: new ObjectId(groupChatInviteId) });

    if (!groupChatInvite) {
      return res
        .status(404)
        .json({ message: "존재하지 않는 그룹 채팅방 초대 요청입니다." });
    }

    // 그룹 채팅방 사용자 목록에 중복 없이 사용자 추가
    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: new ObjectId(groupChatId) },
        { $addToSet: { users: othersData._id.toString() } }
      );

    // 사용자의 그룹 채팅방 순서 목록에 중복 없이 새 채팅방 추가
    await db
      .getDb()
      .collection("users")
      .updateOne(
        { _id: othersData._id },
        { $addToSet: { groupChatOrder: groupChatId } }
      );

    // 그룹 채팅방 초대 목록에서 제거
    await db
      .getDb()
      .collection("groupChatInvites")
      .deleteOne({ _id: new ObjectId(groupChatInviteId) });

    // 변경된 그룹 채팅방 정보 조회
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
          avatarImageUrl: othersData.avatarImageUrl,
        });
      }
    });

    // 클릭한 사용자(othersData._id)가 requester인지 receiver인지 판별
    const requesterChecked =
      othersData._id.toString() === groupChatInvite.requester.toString();

    // 상대방 사용자 ID 조회
    const otherUserId = requesterChecked
      ? groupChatInvite.receiver
      : groupChatInvite.requester;

    // 상대방이 온라인 상태인 경우 실시간 알림 전송
    const socketId = onlineUsers.get(otherUserId.toString());

    if (socketId) {
      io.to(socketId).emit("acceptGroupChatInvite", groupChatInviteId);
    }

    res.status(200).json({ message: "그룹 채팅방 초대 수락 완료" });
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

    // 그룹 채팅방 초대 조회
    const groupChatInvite = await db
      .getDb()
      .collection("groupChatInvites")
      .findOne({ _id: new ObjectId(groupChatInviteId) });

    // 클릭한 사용자(othersData._id)가 requester인지 receiver인지 판별
    const requesterChecked =
      othersData._id.toString() === groupChatInvite.requester.toString();

    // 상대방 사용자 ID 조회
    const otherUserId = requesterChecked
      ? groupChatInvite.receiver
      : groupChatInvite.requester;

    // 그룹 채팅방 초대 제거
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

    // 상대방이 온라인 상태인 경우 실시간 알림 전송
    const socketId = onlineUsers.get(otherUserId.toString());

    if (socketId) {
      io.to(socketId).emit("rejectGroupChatInvite", groupChatInviteId);
    }

    res.status(200).json({ message: "그룹 채팅방 초대 거절 완료" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 초대 거절 중 오류 발생");
  }
});

module.exports = router;
