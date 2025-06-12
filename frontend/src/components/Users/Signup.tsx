import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface signupDataType {
  email: string;
  nickname: string;
  username: string;
  password: string;
  confirmPassword: string;
  avatarColor: string;
}

const Signup = () => {
  // 환경 변수에서 API URL 가져오기
  const apiURL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const avatarColors = [
    "#D32F2F",
    "#C2185B",
    "#7B1FA2",
    "#512DA8",
    "#303F9F",
    "#1976D2",
    "#0288D1",
    "#0097A7",
    "#00796B",
    "#388E3C",
    "#689F38",
    "#FFA000",
    "#F57C00",
    "#E64A19",
    "#5D4037",
    "#455A64",
    "#607D8B",
    "#009688",
    "#AB47BC",
    "#1E88E5",
  ];

  const [signupData, setSignupData] = useState<signupDataType>({
    email: "",
    nickname: "",
    username: "",
    password: "",
    confirmPassword: "",
    avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)], // 랜덤으로 색 배정
  });

  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = event.target;
    setSignupData({ ...signupData, [name]: value });
  };

  const loginMoveHandler = () => {
    navigate("/login");
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    try {
      const response = await fetch(`${apiURL}/signup`, {
        method: "POST",
        body: JSON.stringify(signupData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(true);
        setErrorMessage(errorData.message);
        return;
      }

      console.log("회원가입 성공");
      // setError(false)
      loginMoveHandler();
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "회원가입 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
    console.log(signupData, "회원가입 성공");
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        <h2>회원가입</h2>
        <label htmlFor="email">이메일</label>
        <div>
          <input
            required
            type="email"
            id="email"
            name="email"
            value={signupData.email}
            onChange={inputChangeHandler}
          />
        </div>

        <label htmlFor="nickname">닉네임</label>
        <div>
          <input
            required
            type="text"
            id="nickname"
            name="nickname"
            maxLength={15}
            value={signupData.nickname}
            onChange={inputChangeHandler}
          />
        </div>

        <label htmlFor="username">사용자명</label>
        <div>
          <input
            required
            type="text"
            id="username"
            name="username"
            value={signupData.username}
            onChange={inputChangeHandler}
          />
        </div>

        <label htmlFor="password">비밀번호</label>
        <div>
          <input
            required
            type="password"
            id="password"
            name="password"
            value={signupData.password}
            onChange={inputChangeHandler}
          />
        </div>

        <label htmlFor="confirm-password">비밀번호 확인</label>
        <div>
          <input
            required
            type="password"
            id="confirm-password"
            name="confirmPassword"
            value={signupData.confirmPassword}
            onChange={inputChangeHandler}
          />
        </div>
        {error && <p>{errorMessage}</p>}
        <button type="submit">가입</button>
      </form>
      <div>
        이미 계정이 있으신가요?
        <button onClick={loginMoveHandler}>로그인</button>
      </div>
    </>
  );
};

export default Signup;
