const express = require("express");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../data/database");
const {
  accessToken,
  refreshToken,
  refreshTokenExp,
} = require("../middlewares/jwt-auth");
const { errorHandler } = require("../utils/error-handler");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

// 회원가입 라우터
router.post("/signup", async (req, res) => {
  try {
    const {
      email,
      nickname,
      username,
      password,
      confirmPassword,
      avatarColor,
    } = req.body;

    // 닉네임, 사용자명을 한글, 영문 대소문자, 숫자만 허용 (특수문자 제외)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    const usernameRegex = /^[가-힣a-zA-Z0-9]+$/;

    // 회원가입 입력값 검증 및 유효성 확인
    if (
      !email ||
      !nickname ||
      !username ||
      !password ||
      !confirmPassword ||
      !email.includes("@") ||
      username.trim().length > 5 ||
      password.trim().length < 6 ||
      password !== confirmPassword ||
      nickname.trim().length < 2 ||
      nickname.trim().length > 15
    ) {
      let message = "잘못된 입력입니다. 다시 입력해주세요.";

      if (username.trim().length > 5) {
        message = "사용자명은 5자리까지 입력할 수 있습니다.";
      } else if (password.trim().length < 6) {
        message = "비밀번호를 6자리 이상 입력해 주세요.";
      } else if (password !== confirmPassword) {
        message = "비밀번호와 동일하게 입력해 주세요.";
      } else if (nickname.trim().length < 2 || nickname.trim().length > 15) {
        message = "닉네임은 2자 이상 15자 이하로 입력해 주세요.";
      }

      res.status(400).json({ message });
      return;
    }

    // 닉네임 형식 검사
    if (!nicknameRegex.test(nickname)) {
      return res.status(400).json({
        message: "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.",
      });
    }

    // 사용자명 형식 검사
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "사용자명은 한글, 영문, 숫자만 사용할 수 있습니다.",
      });
    }

    // 한국 시간(KST) 기준 생성 시간
    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // 이메일 중복 여부 확인
    const existingUser = await db
      .getDb()
      .collection("users")
      .findOne({ email });

    // 이메일 중복 시 오류 메시지 전송
    if (existingUser) {
      return res.status(400).json({
        message: "해당 이메일은 이미 사용중입니다.",
      });
    }

    // 비밀번호를 해시하여 저장
    const hashPassword = await bcrypt.hash(password, 12);

    // 회원가입 정보 저장
    const user = {
      email,
      nickname,
      username,
      password: hashPassword,
      avatarColor,
      theme: "dark",
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
    };

    // 사용자 저장
    await db.getDb().collection("users").insertOne(user);

    res.status(200).json({ message: "회원가입 성공" });
  } catch (error) {
    errorHandler(res, error, "회원가입 중 오류 발생");
  }
});

// 로그인 라우터
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 로그인 사용자 조회
    const existingLoginUser = await db
      .getDb()
      .collection("users")
      .findOne({ email });

    // 이메일이 존재하지 않거나 비밀번호가 일치하지 않는 경우 오류 메시지 전송
    if (!existingLoginUser) {
      return res.status(400).json({ message: "존재하지 않는 이메일입니다." });
    }

    // 해시된 비밀번호와 사용자가 입력한 비밀번호 비교
    const passwordEqual = await bcrypt.compare(
      password,
      existingLoginUser.password
    );

    if (!passwordEqual) {
      return res.status(400).json({ message: "패스워드가 일치하지 않습니다." });
    }

    // JWT 서명에 사용할 비밀 키
    const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
    const refreshTokenKey = process.env.REFRESH_TOKEN_KEY;

    // Access Token 발급
    const accessToken = jwt.sign(
      {
        _id: existingLoginUser._id,
        name: existingLoginUser.name,
        email: existingLoginUser.email,
        // role: userRole,
      },
      accessTokenKey,
      { expiresIn: "1h", issuer: "GGPAN" }
      // { expiresIn: "5m", issuer: "GGPAN" } // 테스트용
    );

    // Refresh Token 발급
    const refreshToken = jwt.sign(
      {
        _id: existingLoginUser._id,
        name: existingLoginUser.name,
        email: existingLoginUser.email,
        // role: userRole,
      },
      refreshTokenKey,
      { expiresIn: "30d", issuer: "GGPAN" }
      // { expiresIn: "15m", issuer: "GGPAN" } // 테스트용
    );

    const isProduction = process.env.NODE_ENV === "production";

    // 쿠키에 토큰 저장 (httpOnly 옵션으로 클라이언트에서 직접 접근 불가)
    res.cookie("accessToken", accessToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 60 * 60 * 1000, // 1시간
      // maxAge: 5 * 60 * 1000, // 테스트용
    });

    res.cookie("refreshToken", refreshToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 30 * 60 * 60 * 1000, // 30일
      // maxAge: 15 * 60 * 1000, // 테스트용
    });

    res.status(200).json({ message: "로그인 성공", accessToken, refreshToken });
  } catch (error) {
    errorHandler(res, error, "로그인 중 오류 발생");
  }
});

// Access Token 유효성 확인 라우터
router.get("/accessToken", async (req, res) => {
  try {
    const responseData = await accessToken(req, res);

    if (!responseData) {
      return res.status(401).json({ message: "jwt error" });
    }

    res.status(200).json(responseData);
  } catch (error) {
    errorHandler(res, error, "Access Token 확인 중 오류 발생");
  }
});

// Refresh Token 유효성 확인 라우터
router.get("/refreshToken", async (req, res) => {
  try {
    const responseData = await refreshToken(req, res);

    if (!responseData) {
      return res.status(401).json({ message: "jwt error" });
    }

    res.status(200).json(responseData);
  } catch (error) {
    errorHandler(res, error, "토큰 재생성 중 오류 발생");
  }
});

// Refresh Token 만료 여부 확인 라우터
router.get("/refreshTokenExp", async (req, res) => {
  try {
    const responseData = await refreshTokenExp(req, res);

    if (!responseData) {
      return res.status(401).json({ message: "jwt error" });
    }

    res.status(200).json(responseData);
  } catch (error) {
    errorHandler(res, error, "Refresh Token 만료 시간 확인 중 오류 발생");
  }
});

// 마지막으로 읽은 메시지 정보 조회 라우터
// 현재 사용하지 않아 주석 처리 (추후 재구현 예정)
// router.get("/lastReadMessages", async (req, res) => {
//   try {
//     const othersData = await accessToken(req, res);

//     if (!othersData) {
//       return res.status(401).json({ message: "jwt error" });
//     }

//     const lastReadMessages = await db
//       .getDb()
//       .collection("lastReadMessages")
//       .find({ userId: othersData._id })
//       .toArray();

//     res.status(200).json({ lastReadMessages });
//   } catch (error) {
//     errorHandler(res, error, "마지막으로 읽은 메시지 불러오는 중 오류 발생");
//   }
// });

// 테마 모드 업데이트 라우터
router.patch("/updateTheme", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const requestBody = req.body;

    // 로그인한 사용자 ID
    const userId = new ObjectId(othersData._id);

    // 사용자 테마 업데이트
    await db
      .getDb()
      .collection("users")
      .updateOne({ _id: userId }, { $set: { theme: requestBody.theme } });

    res.status(200).json({ message: "테마 모드 업데이트" });
  } catch (error) {
    errorHandler(res, error, "테마 모드 업데이트 중 오류 발생");
  }
});

// 사용자 정보 수정 라우터
router.patch("/editUserProfileForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const requestBody = req.body;
    const currentUserId = requestBody._id;

    const userId = new ObjectId(currentUserId);
    const newNickname = requestBody.nickname;
    const newAvatarColor = requestBody.avatarColor;
    const newAvatarImageUrl = requestBody.avatarImageUrl;

    // 사용자 정보 조회
    const userInfo = await db
      .getDb()
      .collection("users")
      .findOne({ _id: userId });

    if (!userInfo) {
      return res
        .status(404)
        .json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 사용자 정보 수정 권한 확인
    if (userInfo.email !== othersData.email) {
      return res
        .status(403)
        .json({ message: "사용자 정보를 수정할 권한이 없습니다." });
    }

    // 수정할 사용자 프로필 정보
    const editUserProfile = {
      nickname: newNickname,
      ...(newAvatarImageUrl
        ? { avatarImageUrl: newAvatarImageUrl, avatarColor: null }
        : { avatarImageUrl: null, avatarColor: newAvatarColor }),
    };

    // 사용자 프로필 변경 사항을 관련 컬렉션에 일괄 반영
    await Promise.all([
      // users 컬렉션: _id 기준으로 닉네임, 아바타 색 업데이트
      db
        .getDb()
        .collection("users")
        .updateOne({ _id: userId }, { $set: editUserProfile }),

      // chatMessages 컬렉션: email 기준 업데이트
      db
        .getDb()
        .collection("chatMessages")
        .updateMany({ email: userInfo.email }, { $set: editUserProfile }),

      // groupChat 컬렉션: hostId 기준 업데이트
      db
        .getDb()
        .collection("groupChats")
        .updateMany(
          { hostId: currentUserId },
          {
            $set: {
              hostNickname: newNickname,
              hostAvatarColor: newAvatarColor ?? null,
              hostAvatarImageUrl: newAvatarImageUrl ?? null,
            },
          }
        ),

      // directChats 컬렉션: participants 배열 내에서 _id 일치 시 업데이트
      db
        .getDb()
        .collection("directChats")
        .updateMany(
          { "participants._id": currentUserId },
          {
            $set: {
              "participants.$[participant].nickname": newNickname,
              "participants.$[participant].avatarColor": newAvatarColor ?? null,
              "participants.$[participant].avatarImageUrl":
                newAvatarImageUrl ?? null,
            },
          },
          { arrayFilters: [{ "participant._id": currentUserId }] }
        ),

      // friends 컬렉션: requester.id 또는 receiver.id 내의 _id 일치 시 업데이트
      db
        .getDb()
        .collection("friends")
        .updateMany(
          { "requester.id": userId },
          {
            $set: {
              "requester.nickname": newNickname,
              "requester.avatarColor": newAvatarColor ?? null,
              "requester.avatarImageUrl": newAvatarImageUrl ?? null,
            },
          }
        ),
      db
        .getDb()
        .collection("friends")
        .updateMany(
          { "receiver.id": userId },
          {
            $set: {
              "receiver.nickname": newNickname,
              "receiver.avatarColor": newAvatarColor ?? null,
              "receiver.avatarImageUrl": newAvatarImageUrl ?? null,
            },
          }
        ),

      // friendRequests 컬렉션: requester 또는 receiver 일치 시 업데이트
      db
        .getDb()
        .collection("friendRequests")
        .updateMany(
          { requester: userId },
          {
            $set: {
              requesterNickname: newNickname,
              requesterAvatarColor: newAvatarColor ?? null,
              requesterAvatarImageUrl: newAvatarImageUrl ?? null,
            },
          }
        ),
      db
        .getDb()
        .collection("friendRequests")
        .updateMany(
          { receiver: userId },
          {
            $set: {
              receiverNickname: newNickname,
              receiverAvatarColor: newAvatarColor ?? null,
              receiverAvatarImageUrl: newAvatarImageUrl ?? null,
            },
          }
        ),

      // groupChatInvites 컬렉션: requester 또는 receiver 일치 시 업데이트
      db
        .getDb()
        .collection("groupChatInvites")
        .updateMany(
          { requester: userId },
          {
            $set: {
              requesterNickname: newNickname,
              requesterAvatarColor: newAvatarColor ?? null,
              requesterAvatarImageUrl: newAvatarImageUrl ?? null,
            },
          }
        ),
      db
        .getDb()
        .collection("groupChatInvites")
        .updateMany(
          { receiver: userId },
          {
            $set: {
              receiverNickname: newNickname,
              receiverAvatarColor: newAvatarColor ?? null,
              receiverAvatarImageUrl: newAvatarImageUrl ?? null,
            },
          }
        ),
    ]);

    // 친구 목록을 불러와 실시간 반영에 사용
    const friends = await db
      .getDb()
      .collection("friends")
      .find({ $or: [{ "requester.id": userId }, { "receiver.id": userId }] })
      .toArray();

    // 친구 요청 목록을 불러와 실시간 반영에 사용
    const friendRequests = await db
      .getDb()
      .collection("friendRequests")
      .find({ $or: [{ requester: userId }, { receiver: userId }] })
      .toArray();

    // 그룹 채팅방 목록을 불러와 실시간 반영에 사용
    const groupChats = await db
      .getDb()
      .collection("groupChats")
      .find({ users: currentUserId })
      .toArray();

    // 그룹 채팅방 초대 목록을 불러와 실시간 반영에 사용
    const groupChatInvites = await db
      .getDb()
      .collection("groupChatInvites")
      .find({ $or: [{ requester: userId }, { receiver: userId }] })
      .toArray();

    // 실시간으로 변경 사항을 전송할 사용자 ID 저장
    const friendIds = new Set();
    const friendRequestIds = new Set();
    const groupChatUserIds = new Set();
    const groupChatInviteIds = new Set();

    // Socket.io 및 onlineUsers Map 가져오기
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    // 닉네임을 변경한 사용자를 제외한 사용자 ID 저장
    // for (const friend of friends) {
    //   const friendId =
    //     friend.requester.id.toString() === currentUserId
    //       ? friend.receiver.id.toString()
    //       : friend.requester.id.toString();
    //   friendIds.add(friendId);
    // }

    // 친구 목록에 포함된 사용자 ID 저장
    for (const friend of friends) {
      friendIds.add(friend.requester.id.toString());
      friendIds.add(friend.receiver.id.toString());
    }

    // 친구 요청 목록의 사용자 ID 저장
    for (const friendRequest of friendRequests) {
      const friendRequestId =
        friendRequest.requester.toString() === currentUserId
          ? friendRequest.receiver.toString()
          : friendRequest.requester.toString();
      friendRequestIds.add(friendRequestId);
    }

    // 그룹 채팅방 참여 사용자 ID 저장
    for (const groupChat of groupChats) {
      groupChat.users.forEach((groupChatUserId) => {
        groupChatUserIds.add(groupChatUserId);
      });
    }

    // 그룹 채팅방 초대 목록의 사용자 ID 저장
    for (const groupChatInvite of groupChatInvites) {
      groupChatInviteIds.add(groupChatInvite.requester.toString());
      groupChatInviteIds.add(groupChatInvite.receiver.toString());
    }

    // 친구 목록에 프로필 변경 사항 실시간 반영
    for (const friendId of friendIds) {
      const socketId = onlineUsers.get(friendId);
      if (socketId) {
        io.to(socketId).emit("chatProfileUpdated", {
          userEmail: userInfo.email,
          newNickname,
          newAvatarColor,
          newAvatarImageUrl,
        });

        io.to(socketId).emit("friendProfileUpdated", {
          userId: currentUserId,
          newNickname,
          newAvatarColor,
          newAvatarImageUrl,
        });

        io.to(socketId).emit("directChatProfileUpdated", {
          userId: currentUserId,
          newNickname,
          newAvatarColor,
          newAvatarImageUrl,
        });
      }
    }

    // 친구 요청 목록에 프로필 변경 사항 실시간 반영
    for (const friendRequestId of friendRequestIds) {
      const socketId = onlineUsers.get(friendRequestId);
      if (socketId) {
        io.to(socketId).emit("friendRequestProfileUpdated", {
          userId: currentUserId,
          newNickname,
          newAvatarColor,
          newAvatarImageUrl,
        });
      }
    }

    // 그룹 채팅방 참여자에게 프로필 변경 사항 실시간 반영
    for (const groupChatUserId of groupChatUserIds) {
      const socketId = onlineUsers.get(groupChatUserId);
      if (socketId) {
        io.to(socketId).emit("groupChatHostProfileUpdated", {
          userId: currentUserId,
          newNickname,
          newAvatarColor,
          newAvatarImageUrl,
        });

        io.to(socketId).emit("groupChatUserProfileUpdated", {
          userId: currentUserId,
          newNickname,
          newAvatarColor,
          newAvatarImageUrl,
        });
      }
    }

    // 그룹 채팅방 초대 목록에 프로필 변경 사항 실시간 반영
    for (const groupChatInviteId of groupChatInviteIds) {
      const socketId = onlineUsers.get(groupChatInviteId);
      if (socketId) {
        io.to(socketId).emit("groupChatInviteProfileUpdated", {
          userId: currentUserId,
          newNickname,
          newAvatarColor,
          newAvatarImageUrl,
        });
      }
    }

    res.status(200).json({ editUserProfile });
  } catch (error) {
    errorHandler(res, error, "사용자 정보 수정 중 오류 발생");
  }
});

// 사용자 비밀번호 수정 라우터
router.patch("/editUserPasswordForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const requestBody = req.body;

    const password = requestBody.password;
    const newPassword = requestBody.newPassword;
    const confirmNewPassword = requestBody.confirmNewPassword;

    // 사용자 정보 조회
    const userInfo = await db
      .getDb()
      .collection("users")
      .findOne({ _id: othersData._id });

    if (!userInfo) {
      return res
        .status(404)
        .json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 해시된 비밀번호와 사용자가 입력한 비밀번호 비교
    const passwordEqual = await bcrypt.compare(password, userInfo.password);

    if (!passwordEqual) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 새로운 비밀번호 입력값 검증 및 유효성 확인
    if (newPassword.trim().length < 6) {
      return res
        .status(400)
        .json({ message: "비밀번호를 6자리 이상 입력해 주세요." });
    }

    // 기존 비밀번호와 새로운 비밀번호 입력값 간의 검증 및 유효성 확인
    if (password === newPassword) {
      return res
        .status(400)
        .json({ message: "새 비밀번호가 현재 비밀번호와 동일합니다." });
    }

    // 새로운 비밀번호와 새로운 비밀번호 확인 입력값 간의 검증 및 유효성 확인
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "수정한 비밀번호가 일치하지 않습니다." });
    }

    // 비밀번호를 해시하여 저장
    const hashPassword = await bcrypt.hash(newPassword, 12);

    // 비밀번호 업데이트
    await db
      .getDb()
      .collection("users")
      .updateOne({ _id: othersData._id }, { $set: { password: hashPassword } });

    res.status(200).json({ message: "비밀번호 수정 성공" });
  } catch (error) {
    errorHandler(res, error, "사용자 비밀번호 수정 중 오류 발생");
  }
});

// 사용자 계정 삭제 라우터
router.delete("/deleteUserForm", async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    const requestBody = req.body;

    const password = requestBody.password;
    const confirmText = requestBody.confirmText;

    // 사용자 정보 조회
    const userInfo = await db
      .getDb()
      .collection("users")
      .findOne({ _id: othersData._id });

    // 해시된 비밀번호와 사용자가 입력한 비밀번호 비교
    const passwordEqual = await bcrypt.compare(password, userInfo.password);

    if (!passwordEqual) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 사용자 계정 탈퇴 문구 입력값 검증 및 유효성 확인
    if (confirmText.trim() !== "탈퇴하겠습니다") {
      return res
        .status(400)
        .json({ message: "계정 탈퇴 문구가 일치하지 않습니다." });
    }

    // 다이렉트 채팅방 목록 조회
    const directChats = await db
      .getDb()
      .collection("directChats")
      .find({
        "participants._id": userInfo._id.toString(),
      })
      .toArray();

    // 다이렉트 채팅방 번호 저장
    const directChatRoomIds = directChats.map((room) => room._id);

    // 호스트인 그룹 채팅방 목록 조회
    const hostGroupChats = await db
      .getDb()
      .collection("groupChats")
      .find({ hostId: userInfo._id.toString() })
      .toArray();

    // 호스트인 그룹 채팅방 번호 저장
    const hostGroupChatRoomIds = hostGroupChats.map((room) => room._id);

    // 삭제할 채팅방 번호 저장
    const allDeleteRoomIds = [...directChatRoomIds, ...hostGroupChatRoomIds];

    // 사용자 계정 삭제 사항을 관련 컬렉션에 일괄 반영
    await Promise.all([
      // 채팅 메시지 삭제
      db
        .getDb()
        .collection("chatMessages")
        .deleteMany({ roomId: { $in: allDeleteRoomIds } }),

      // 다이렉트 채팅방 삭제
      db
        .getDb()
        .collection("directChats")
        .deleteMany({ "participants._id": userInfo._id.toString() }),

      // 그룹 채팅방 참여자 목록에서 제거
      db
        .getDb()
        .collection("groupChats")
        .updateMany(
          { users: userInfo._id.toString() },
          { $pull: { users: userInfo._id.toString() } }
        ),

      // 호스트인 그룹 채팅방 삭제
      db
        .getDb()
        .collection("groupChats")
        .deleteMany({ hostId: userInfo._id.toString() }),

      // 그룹 채팅방 초대 삭제
      db
        .getDb()
        .collection("groupChatInvites")
        .deleteMany({
          $or: [{ requester: userInfo._id }, { receiver: userInfo._id }],
        }),

      // 마지막으로 읽은 메시지 삭제
      db
        .getDb()
        .collection("lastReadMessages")
        .deleteMany({ userId: userInfo._id }),

      // 친구 목록 삭제
      db
        .getDb()
        .collection("friends")
        .deleteMany({
          $or: [
            { "requester.id": userInfo._id },
            { "receiver.id": userInfo._id },
          ],
        }),

      // 친구 요청 삭제
      db
        .getDb()
        .collection("friendRequests")
        .deleteMany({
          $or: [{ requester: userInfo._id }, { receiver: userInfo._id }],
        }),

      // 사용자 계정 삭제
      db.getDb().collection("users").deleteOne({ _id: userInfo._id }),
    ]);

    // 쿠키에 저장된 Access Token 삭제
    res.clearCookie("accessToken", {
      secure: isProduction, // 쿠키 설정 시 사용한 옵션과 동일하게
      sameSite: isProduction ? "None" : "Lax", // sameSite도 동일하게
    });

    // 쿠키에 저장된 Refresh Token 삭제
    res.clearCookie("refreshToken", {
      secure: isProduction, // 쿠키 설정 시 사용한 옵션과 동일하게
      sameSite: isProduction ? "None" : "Lax", // sameSite도 동일하게
    });

    res.status(200).json({ message: "계정 삭제 성공" });
  } catch (error) {
    errorHandler(res, error, "사용자 계정 삭제 중 오류 발생");
  }
});

// 재정렬된 그룹 채팅방 목록 업데이트 라우터
router.patch("/user/group-chat-order", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    // 재정렬된 그룹 채팅방 순서
    const { groupChatOrder } = req.body;

    // 사용자 조회
    const user = await db
      .getDb()
      .collection("users")
      .findOne({ _id: othersData._id });

    if (!user) {
      return res
        .status(404)
        .json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 사용자의 그룹 채팅방 순서 목록 업데이트
    await db
      .getDb()
      .collection("users")
      .updateOne({ _id: othersData._id }, { $set: { groupChatOrder } });

    res.status(200).json({ message: "그룹 채팅방 목록 업데이트" });
  } catch (error) {
    errorHandler(res, error, "그룹 채팅방 목록 저장 중 오류 발생");
  }
});

// 로그아웃 라우터
router.post("/logout", async (req, res) => {
  // 현재 실행 환경 확인 (개발/운영)
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // 쿠키에 저장된 Access Token 삭제
    res.clearCookie("accessToken", {
      secure: isProduction, // 쿠키 설정 시 사용한 옵션과 동일하게
      sameSite: isProduction ? "None" : "Lax", // sameSite도 동일하게
    });

    // 쿠키에 저장된 Refresh Token 삭제
    res.clearCookie("refreshToken", {
      secure: isProduction, // 쿠키 설정 시 사용한 옵션과 동일하게
      sameSite: isProduction ? "None" : "Lax", // sameSite도 동일하게
    });

    res.status(200).json({ message: "로그아웃 성공" });
  } catch (error) {
    errorHandler(res, error, "로그아웃 중 오류 발생");
  }
});

module.exports = router;
