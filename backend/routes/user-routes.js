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

router.post("/signup", async (req, res) => {
  try {
    const { email, nickname, username, password, confirmPassword } = req.body;

    // 닉네임, 사용자명을 한글, 영문 대소문자, 숫자만 허용 (특수문자 제외)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    const usernameRegex = /^[가-힣a-zA-Z0-9]+$/;

    // 이메일, 닉네임, 사용자명, 패스워드 등 잘못된 입력을 확인하는 코드
    // 조건이 맞지 않으면 오류 메시지와 함께 요청을 거절
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

    // 형식 검사 (닉네임, 사용자명)
    if (!nicknameRegex.test(nickname)) {
      return res.status(400).json({
        message: "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.",
      });
    }

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "사용자명은 한글, 영문, 숫자만 사용할 수 있습니다.",
      });
    }

    let date = new Date();
    let kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    // DB에서 이미 사용 중인 이메일인지 확인
    const existingUser = await db
      .getDb()
      .collection("users")
      .findOne({ email });

    // 이메일이 이미 존재하면 오류 메시지 전송
    if (existingUser) {
      return res.status(400).json({
        message: "해당 이메일은 이미 사용중입니다.",
      });
    }

    // 비밀번호를 해시하여 DB에 저장
    const hashPassword = await bcrypt.hash(password, 12);

    const user = {
      email,
      nickname,
      username,
      password: hashPassword,
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

    // 새 사용자 데이터를 MongoDB에 저장
    const result = await db.getDb().collection("users").insertOne(user);

    console.log(result);

    res.status(200).json({ message: "회원가입 성공" });
  } catch (error) {
    errorHandler(res, error, "회원가입 중 오류 발생");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력한 이메일이 DB에 존재하는지 확인
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
      // { expiresIn: "1h", issuer: "GGPAN" }
      { expiresIn: "5m", issuer: "GGPAN" }
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
      // { expiresIn: "30d", issuer: "GGPAN" }
      { expiresIn: "15m", issuer: "GGPAN" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    console.log("현재 환경:", process.env.NODE_ENV, isProduction);

    // 쿠키에 토큰 저장 (httpOnly 옵션으로 클라이언트에서 직접 접근 불가)
    res.cookie("accessToken", accessToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      // maxAge: 60 * 60 * 1000, // 1시간
      maxAge: 5 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      // maxAge: 24 * 30 * 60 * 60 * 1000, // 30일
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "로그인 성공", accessToken, refreshToken });
  } catch (error) {
    errorHandler(res, error, "로그인 중 오류 발생");
  }
});

// Access Token 확인
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

// Refresh Token 확인
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

// Refresh Token 만료 여부 확인
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

// 닉네임 수정 라우터
router.patch("/editNicknameForm", async (req, res) => {
  try {
    const othersData = await accessToken(req, res);

    if (!othersData) {
      return res.status(401).json({ message: "jwt error" });
    }

    console.log(othersData);

    console.log("백엔드에서 req.body:", req.body);

    const requestBody = req.body;

    console.log(requestBody.modalData);

    const userId = new ObjectId(requestBody.modalData._id);
    const newNickname = requestBody.nickname;

    const userInfo = await db
      .getDb()
      .collection("users")
      .findOne({ _id: new ObjectId(requestBody.modalData._id) });

    if (!userInfo) {
      return res
        .status(404)
        .json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 그룹 채팅방 내용과 마찬가지로 로그인한 사용자 이메일이 아닌, 프론트엔드에서 전달한 이메일 정보를 사용하는 것이 좋은가?
    // 만약 로그인한 사용자 이메일이 더 나은 방법이라면, 프론트엔드에서 전달한 이메일 정보가 굳이 필요하지 않기 때문에 관련 내용 삭제 필요
    if (userInfo.email !== othersData.email) {
      return res
        .status(403)
        .json({ message: "사용자 정보를 수정할 권한이 없습니다." });
    }

    const editNickname = {
      nickname: newNickname,
    };

    await db
      .getDb()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(requestBody.modalData._id) },
        { $set: editNickname }
      );

    // chatMessages 컬렉션: email 기준 업데이트
    await db
      .getDb()
      .collection("chatMessages")
      .updateMany(
        { email: userInfo.email },
        { $set: { nickname: newNickname } }
      );

    // groupChat 컬렉션: hostId 기준 업데이트
    await db
      .getDb()
      .collection("groupChat")
      .updateMany(
        { hostId: requestBody.modalData._id },
        { $set: { nickname: newNickname } }
      );

    // directChats 컬렉션: participants 배열 내에서 _id 일치 시 업데이트
    await db
      .getDb()
      .collection("directChats")
      .updateMany(
        { "participants._id": requestBody.modalData._id },
        { $set: { "participants.$[participant].nickname": newNickname } },
        { arrayFilters: [{ "participant._id": requestBody.modalData._id }] }
      );

    // friends 컬렉션: requester 또는 receiver 내의 _id 일치 시 업데이트
    await db
      .getDb()
      .collection("friends")
      .updateMany(
        { "requester.id": userId },
        { $set: { "requester.nickname": newNickname } }
      );

    await db
      .getDb()
      .collection("friends")
      .updateMany(
        { "receiver.id": userId },
        { $set: { "receiver.nickname": newNickname } }
      );

    // friendRequests 컬렉션: requester 또는 receiver 일치 시 업데이트
    await db
      .getDb()
      .collection("friendRequests")
      .updateMany(
        { requester: userId },
        { $set: { requesterNickname: newNickname } }
      );

    await db
      .getDb()
      .collection("friendRequests")
      .updateMany(
        { receiver: userId },
        { $set: { receiverNickname: newNickname } }
      );

    // groupChatInvites 컬렉션: requester 또는 receiver 일치 시 업데이트
    await db
      .getDb()
      .collection("groupChatInvites")
      .updateMany(
        { requester: userId },
        { $set: { requesterNickname: newNickname } }
      );

    await db
      .getDb()
      .collection("groupChatInvites")
      .updateMany(
        { receiver: userId },
        { $set: { receiverNickname: newNickname } }
      );

    res.status(200).json({ editNickname });
  } catch (error) {
    errorHandler(res, error, "사용자 닉네임 수정 중 오류 발생");
  }
});

// 로그아웃 처리, 쿠키에서 토큰 제거
router.post("/logout", async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  try {
    res.clearCookie("accessToken", {
      secure: isProduction, // 쿠키 설정 시 사용한 옵션과 동일하게
      sameSite: isProduction ? "None" : "Lax", // sameSite도 동일하게
    });
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
