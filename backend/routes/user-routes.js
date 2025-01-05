const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../data/database");
const {
  accessToken,
  refreshToken,
  refreshTokenExp,
} = require("../middlewares/jwt-auth");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, nickname, username, password, confirmPassword } = req.body;

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
      password !== confirmPassword
    ) {
      let message = "잘못된 입력입니다. 다시 입력해주세요.";

      if (username.trim().length > 5) {
        message = "사용자명은 5자리까지 입력할 수 있습니다.";
      } else if (password.trim().length < 6) {
        message = "비밀번호를 6자리 이상 입력해 주세요.";
      } else if (password !== confirmPassword) {
        message = "비밀번호와 동일하게 입력해 주세요.";
      }

      res.status(400).json({ message });
      return;
    }

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
      { expiresIn: "2h", issuer: "GGPAN" }
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
      { expiresIn: "6h", issuer: "GGPAN" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    console.log("현재 환경:", process.env.NODE_ENV, isProduction);

    // 쿠키에 토큰 저장 (httpOnly 옵션으로 클라이언트에서 직접 접근 불가)
    res.cookie("accessToken", accessToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 2 * 60 * 60 * 1000, // 2시간
    });

    res.cookie("refreshToken", refreshToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 6 * 60 * 60 * 1000, // 6시간
    });

    res.status(200).json({ message: "로그인 성공", accessToken, refreshToken });
  } catch (error) {
    console.error("로그인 중 오류 발생:", error.message);
    res.status(500).json({ error: "로그인에 실패했습니다." });
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
    errorHandler(res, error, "Refresh Token 확인 중 오류 발생");
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

module.exports = router;
