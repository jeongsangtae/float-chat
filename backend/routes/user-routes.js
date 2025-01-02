const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    const signupEmail = userData.email;
    const signupNickname = userData.nickname;
    const signupUsername = userData.username;
    const signupPassword = userData.password;
    const signupConfirmPassword = userData.confirmPassword;

    // 이메일, 닉네임, 사용자명, 패스워드 등 잘못된 입력을 확인하는 코드
    // 조건이 맞지 않으면 오류 메시지와 함께 요청을 거절
    if (
      !signupEmail ||
      !signupNickname ||
      !signupUsername ||
      !signupPassword ||
      !signupConfirmPassword ||
      !signupEmail.includes("@") ||
      signupUsername.trim().length > 5 ||
      signupPassword.trim().length < 6 ||
      signupPassword !== signupConfirmPassword
    ) {
      let message = "잘못된 입력입니다. 다시 입력해주세요.";

      if (signupUsername.trim().length > 5) {
        message = "이름은 5자리까지 입력할 수 있습니다.";
      } else if (signupPassword.trim().length < 6) {
        message = "비밀번호를 6자리 이상 입력해 주세요.";
      } else if (signupPassword !== signupConfirmPassword) {
        message = "비밀번호와 동일하게 입력해 주세요.";
      }

      res.status(400).json({ message });
      return;
    }

    // DB에서 이미 사용 중인 이메일인지 확인
    const existingSignUpUser = await db
      .getDb()
      .collection("users")
      .findOne({ email: signupEmail });

    // 이메일이 이미 존재하면 오류 메시지 전송
    if (existingSignUpUser) {
      return res.status(400).json({
        message: "해당 이메일은 이미 사용중입니다.",
      });
    }

    // 비밀번호를 해시하여 DB에 저장
    const hashPassword = await bcrypt.hash(signupPassword, 12);
    const hashConfirmPassword = await bcrypt.hash(signupConfirmPassword, 12);

    const user = {
      email: signupEmail,
      nickname: signupNickname,
      username: signupUsername,
      password: hashPassword,
      confirmPassword: hashConfirmPassword,
    };

    // 새 사용자 데이터를 MongoDB에 저장
    const result = await db.getDb().collection("users").insertOne(user);

    console.log(result);

    res.status(200).json({ message: "회원가입 성공" });
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error.message);
    res.status(500).json({ error: "회원가입에 실패했습니다." });
  }
});

module.exports = router;
