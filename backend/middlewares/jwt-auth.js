const jwt = require("jsonwebtoken");
const db = require("../data/database");

// Access Token을 검증하고 사용자 데이터를 반환하는 함수
const accessToken = async (req, res) => {
  try {
    const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
    const token = req.cookies.accessToken;
    // Access Token 검증
    const loginUserTokenData = jwt.verify(token, accessTokenKey);

    const loginUserDbData = await db
      .getDb()
      .collection("users")
      .findOne({ email: loginUserTokenData.email });

    // 디스트럭처링을 통해서 password를 제외한 나머지 사용자 데이터만 가져옴
    const { password, ...othersData } = loginUserDbData;

    // 응답 데이터에 토큰 만료 시간과 역할(role)을 추가하여 반환
    const responseData = {
      ...othersData,
      tokenExp: loginUserTokenData.exp,
      // role: loginUserTokenData.role,
    };

    return responseData; // 사용자 데이터 반환
  } catch (error) {
    return null; // 토큰 검증 실패 또는 사용자 조회 실패
  }
};

// Access Token을 새로 발급하는 함수 (refresh token 사용)
const refreshToken = async (req, res) => {
  try {
    const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
    const refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
    const token = req.cookies.refreshToken;
    // // Refresh Token 검증
    const loginUserTokenData = jwt.verify(token, refreshTokenKey);

    const loginUserDbData = await db
      .getDb()
      .collection("users")
      .findOne({ email: loginUserTokenData.email });

    // Access Token 발급
    const accessToken = jwt.sign(
      {
        _id: loginUserDbData._id,
        name: loginUserDbData.name,
        email: loginUserDbData.email,
        // role: loginUserTokenData.role,
      },
      accessTokenKey,
      // { expiresIn: "1h", issuer: "GGPAN" } // 토큰 유효시간 1시간 설정
      { expiresIn: "5m", issuer: "GGPAN" }
    );

    // Refresh Token 발급
    const refreshToken = jwt.sign(
      {
        _id: loginUserDbData._id,
        name: loginUserDbData.name,
        email: loginUserDbData.email,
      },
      refreshTokenKey,
      { expiresIn: "15m", issuer: "GGPAN" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Access Token 쿠키 저장
    res.cookie("accessToken", accessToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 5 * 60 * 1000,
    });

    // Refresh Token 쿠키 저장
    res.cookie("refreshToken", refreshToken, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 15 * 60 * 1000,
    });

    // password를 제외한 사용자 정보만 반환
    const { password, ...othersData } = loginUserDbData;

    // 사용자 정보와 토큰 만료 시간을 함께 사용할 수 있도록 반환
    const responseData = {
      ...othersData,
      tokenExp: loginUserTokenData.exp,
      // role: loginUserTokenData.role,
    };

    return responseData; // 사용자 데이터 반환
  } catch (error) {
    return null; // 토큰 검증 실패 또는 사용자 조회 실패
  }
};

// Refresh Token의 만료 시간을 반환하는 함수
const refreshTokenExp = async (req, res) => {
  try {
    const refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
    const token = req.cookies.refreshToken;

    // Refresh Token 검증
    const loginUserTokenData = jwt.verify(token, refreshTokenKey);

    // 토큰 만료 시간을 응답 데이터로 반환
    return { tokenExp: loginUserTokenData.exp }; // 만료 시간 데이터를 반환
  } catch (error) {
    return null; // 토큰 검증 실패 또는 사용자 조회 실패
  }
};

module.exports = { accessToken, refreshToken, refreshTokenExp };
