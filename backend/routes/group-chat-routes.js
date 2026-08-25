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
      .find({ "users._id": othersData._id.toString() })
      .toArray();

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
          _id: { $in: userIds.map((user) => new ObjectId(user._id)) },
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
      users: [{ _id: hostId, role: "host" }],
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
    const authorizedUser = groupChat.users.some(
      (user) =>
        user._id === othersData._id.toString() &&
        (user.role === "host" || user.role === "admin")
    );

    if (!authorizedUser) {
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
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);
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
    const authorizedUser = groupChat.users.some(
      (user) =>
        user._id === othersData._id.toString() &&
        (user.role === "host" || user.role === "admin")
    );

    if (!authorizedUser) {
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
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);
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
    const authorizedUser = groupChat.users.some(
      (user) =>
        user._id === othersData._id.toString() &&
        (user.role === "host" || user.role === "admin")
    );

    if (!authorizedUser) {
      return res
        .status(403)
        .json({ message: "그룹 채팅방 공지사항을 수정할 권한이 없습니다." });
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
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

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

// 호스트 권한 위임 라우터
router.patch("/groupChatTransferHost/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const { targetUserId } = req.body;
    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res.status(404).json({
        message: "그룹 채팅방을 찾을 수 없습니다.",
      });
    }

    if (groupChat.hostId !== othersData._id.toString()) {
      return res.status(403).json({
        message: "호스트만 권한을 위임할 수 있습니다.",
      });
    }

    const targetUser = await db
      .getDb()
      .collection("users")
      .findOne({ _id: new ObjectId(targetUserId) });

    if (!targetUser) {
      return res.status(404).json({
        message: "해당 사용자를 찾을 수 없습니다.",
      });
    }

    const targetMember = groupChat.users.find(
      (user) => user._id === targetUserId
    );

    if (!targetMember) {
      return res.status(400).json({
        message: "해당 사용자는 그룹 채팅방의 멤버가 아닙니다.",
      });
    }

    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: roomId },
        {
          $set: {
            hostId: targetUserId,
            hostEmail: targetUser.email,
            hostUsername: targetUser.username,
            hostNickname: targetUser.nickname,
            hostAvatarColor: targetUser.avatarColor,
            hostAvatarImageUrl: targetUser.avatarImageUrl,
            "users.$[currentHost].role": "member",
            "users.$[targetUser].role": "host",
          },
        },
        {
          arrayFilters: [
            { "currentHost._id": othersData._id.toString() },
            { "targetUser._id": targetUserId },
          ],
        }
      );

    const updatedGroupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

      if (socketId) {
        io.to(socketId).emit("groupChatHostTransferred", updatedGroupChat);
      }
    });

    res.status(200).json({ message: "호스트 권한 위임 완료" });
  } catch (error) {
    errorHandler(res, error, "호스트 권한 위임 중 오류 발생");
  }
});

// 관리자 권한 부여 라우터
router.patch("/groupChatGrantAdmin/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const { targetUserId } = req.body;
    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res.status(404).json({
        message: "그룹 채팅방을 찾을 수 없습니다.",
      });
    }

    if (groupChat.hostId !== othersData._id.toString()) {
      return res.status(403).json({
        message: "호스트만 권한을 위임할 수 있습니다.",
      });
    }

    const targetMember = groupChat.users.find(
      (user) => user._id === targetUserId
    );

    if (!targetMember) {
      return res.status(400).json({
        message: "해당 사용자는 그룹 채팅방의 멤버가 아닙니다.",
      });
    }

    if (targetMember.role !== "member") {
      return res.status(400).json({
        message: "관리자 권한을 부여할 수 없는 사용자입니다.",
      });
    }

    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: roomId },
        {
          $set: {
            "users.$[targetUser].role": "admin",
          },
        },
        {
          arrayFilters: [{ "targetUser._id": targetUserId }],
        }
      );

    const updatedGroupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

      if (socketId) {
        io.to(socketId).emit("groupChatAdminGranted", updatedGroupChat);
      }
    });

    res.status(200).json({ message: "관리자 권한 부여 완료" });
  } catch (error) {
    errorHandler(res, error, "관리자 권한 부여 중 오류 발생");
  }
});

// 관리자 권한 회수 라우터
router.patch("/groupChatRevokeAdmin/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const { targetUserId } = req.body;
    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res.status(404).json({
        message: "그룹 채팅방을 찾을 수 없습니다.",
      });
    }

    if (groupChat.hostId !== othersData._id.toString()) {
      return res.status(403).json({
        message: "호스트만 권한을 회수할 수 있습니다.",
      });
    }

    const targetMember = groupChat.users.find(
      (user) => user._id === targetUserId
    );

    if (!targetMember) {
      return res.status(400).json({
        message: "해당 사용자는 그룹 채팅방의 멤버가 아닙니다.",
      });
    }

    if (targetMember.role !== "admin") {
      return res.status(400).json({
        message: "해당 사용자는 관리자가 아닙니다.",
      });
    }

    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: roomId },
        {
          $set: {
            "users.$[targetUser].role": "member",
          },
        },
        {
          arrayFilters: [{ "targetUser._id": targetUserId }],
        }
      );

    const updatedGroupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

      if (socketId) {
        io.to(socketId).emit("groupChatAdminRevoked", updatedGroupChat);
      }
    });

    res.status(200).json({ message: "관리자 권한 회수 완료" });
  } catch (error) {
    errorHandler(res, error, "관리자 권한 회수 중 오류 발생");
  }
});

// 사용자 강제 퇴장 라우터
router.patch("/groupChatKickMember/:roomId", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const { targetUserId } = req.body;
    let roomId = req.params.roomId;

    roomId = new ObjectId(roomId);

    const groupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    if (!groupChat) {
      return res.status(404).json({
        message: "그룹 채팅방을 찾을 수 없습니다.",
      });
    }

    // 사용자 강제 퇴장 권한 확인
    const authorizedUser = groupChat.users.some(
      (user) =>
        user._id === othersData._id.toString() &&
        (user.role === "host" || user.role === "admin")
    );

    if (!authorizedUser) {
      return res
        .status(403)
        .json({ message: "사용자를 강제 퇴장 시킬 권한이 없습니다." });
    }

    // 강제 퇴장 대상 확인
    const targetMember = groupChat.users.find(
      (user) => user._id === targetUserId
    );

    if (!targetMember) {
      return res.status(400).json({
        message: "해당 사용자는 그룹 채팅방의 멤버가 아닙니다.",
      });
    }

    // 호스트는 강제 퇴장 불가
    if (targetMember.role === "host") {
      return res.status(400).json({
        message: "호스트는 강제 퇴장시킬 수 없습니다.",
      });
    }

    // 그룹 채팅방에서 사용자 제거
    await db
      .getDb()
      .collection("groupChats")
      .updateOne(
        { _id: roomId },
        {
          $pull: {
            users: { _id: targetUserId },
          },
        }
      );

    const updatedGroupChat = await db
      .getDb()
      .collection("groupChats")
      .findOne({ _id: roomId });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    updatedGroupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

      if (socketId) {
        io.to(socketId).emit("groupChatKickMember", updatedGroupChat);
      }
    });

    // 강제 퇴장당한 사용자에게 강제 퇴장 이벤트 전달
    const targetSocketId = onlineUsers.get(targetUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("groupChatKicked", {
        kickedRoomId: roomId.toString(),
      });
    }

    res.status(200).json({ message: "사용자 강제 퇴장 완료" });
  } catch (error) {
    errorHandler(res, error, "사용자 강제 퇴장 중 오류 발생");
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
          _id: { $in: groupChat.users.map((user) => new ObjectId(user._id)) },
        },
        { $pull: { groupChatOrder: roomId.toString() } }
      );

    // 그룹 채팅방 정보 삭제
    await db.getDb().collection("groupChats").deleteOne({ _id: roomId });

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io"); // Express 앱에서 Socket.io 인스턴스를 가져옴
    const onlineUsers = req.app.get("onlineUsers"); // onlineUsers Map을 가져옴

    // 그룹 채팅방에 참여한 사용자들에게 실시간 알림 전송
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

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

    const { newHostId } = req.body;
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
      (user) => user._id !== othersData._id.toString()
    );

    const host = groupChat.hostId.toString() === othersData._id.toString();

    if (host) {
      // 호스트 ID 유효성 확인
      if (!newHostId) {
        return res.status(400).json({
          message: "새로운 호스트를 선택해야 합니다.",
        });
      }

      // 자기 자신 선택 확인
      if (newHostId === othersData._id.toString()) {
        return res.status(400).json({
          message: "본인을 새로운 호스트로 지정할 수 없습니다.",
        });
      }

      // 새로운 호스트 정보 조회
      const newHost = await db
        .getDb()
        .collection("users")
        .findOne({ _id: new ObjectId(newHostId) });

      if (!newHost) {
        return res
          .status(404)
          .json({ message: "새로운 호스트를 찾을 수 없습니다." });
      }

      // 새로운 호스트 그룹 채팅방 참여 유무 확인
      const newHostMember = groupChat.users.some(
        (user) => user._id === newHostId
      );

      if (!newHostMember) {
        return res
          .status(400)
          .json({ message: "새로운 호스트는 그룹 채팅방의 멤버여야 합니다." });
      }

      // 그룹 채팅방 호스트 정보, 사용자 목록 업데이트
      await db
        .getDb()
        .collection("groupChats")
        .updateOne(
          { _id: roomId },
          {
            $set: {
              hostId: newHost._id,
              hostEmail: newHost.email,
              hostUsername: newHost.username,
              hostNickname: newHost.nickname,
              hostAvatarColor: newHost.avatarColor,
              hostAvatarImageUrl: newHost.avatarImageUrl,
              users: updatedUsers,
            },
          }
        );
    } else {
      // 그룹 채팅방 사용자 목록 업데이트
      await db
        .getDb()
        .collection("groupChats")
        .updateOne({ _id: roomId }, { $set: { users: updatedUsers } });
    }

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
    // 그룹 채팅방 초대 목록 실시간 제거
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

      if (socketId) {
        io.to(socketId).emit("groupChatLeaveInvitesDelete", {
          userId: othersData._id.toString(),
          roomId,
        });
      }
    });

    // 채팅방 나간 사용자를 사용자 목록에서 제거
    updatedUsers.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

      if (socketId) {
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
    if (!groupChat.users.some((user) => user._id === requesterId.toString())) {
      return res.status(403).json({
        message: "그룹 채팅방에 참여한 사용자가 아니므로 초대할 수 없습니다.",
      });
    }

    // 초대할 사용자가 이미 참여 중인지 확인
    const groupChatParticipant = groupChat.users.some(
      (user) => user._id === receiverId.toString()
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
        {
          $addToSet: {
            users: { _id: othersData._id.toString(), role: "member" },
          },
        }
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
    groupChat.users.forEach((user) => {
      const socketId = onlineUsers.get(user._id);

      if (socketId) {
        io.to(socketId).emit("acceptGroupChat", {
          roomId: groupChatId,
          user: {
            _id: othersData._id,
            email: othersData.email,
            nickname: othersData.nickname,
            username: othersData.username,
            avatarColor: othersData.avatarColor,
            avatarImageUrl: othersData.avatarImageUrl,
            onlineChecked: true,
          },
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
