import { useState } from "react";

import AuthModal from "../UI/AuthModal";
import { ModalProps } from "../../types";

interface loginDataType {
  email: string;
  password: string;
}
const Login = ({ onToggle }: ModalProps) => {
  // 환경 변수에서 API URL 가져오기
  const apiURL = import.meta.env.VITE_API_URL;

  const [loginData, setLoginData] = useState<loginDataType>({
    email: "",
    password: "",
  });

  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch(`${apiURL}/login`, {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(true);
        setErrorMessage(errorData.message);
        return null;
      }

      const resData = await response.json();

      console.log("로그인 성공");

      console.log(resData.loginSuccess);
      setLoginSuccess(resData.loginSuccess);
      // onToggle();
    } catch (error) {
      console.error("에러 내용:", error);
      alert("로그인 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
    }
    console.log(loginData, "로그인 성공");
  };

  return (
    <AuthModal onToggle={onToggle}>
      <form onSubmit={submitHandler}>
        {loginSuccess && <p>로그인 상태</p>}
        <h2>로그인</h2>
        <label htmlFor="email">이메일</label>
        <div>
          <input
            required
            type="email"
            id="email"
            name="email"
            value={loginData.email}
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
            value={loginData.password}
            onChange={inputChangeHandler}
          />
        </div>
        {error && <p>{errorMessage}</p>}
        {!loginSuccess && <button type="submit">로그인</button>}
      </form>
    </AuthModal>
  );
};

export default Login;
