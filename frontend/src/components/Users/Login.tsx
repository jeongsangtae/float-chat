import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../../store/authStore";

import classes from "./Login.module.css";

interface loginDataType {
  email: string;
  password: string;
}

const Login = () => {
  // 환경 변수에서 API URL 가져오기
  const apiURL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loginData, setLoginData] = useState<loginDataType>({
    email: "",
    password: "",
  });

  // const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = event.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const signupMoveHandler = () => {
    navigate("/signup");
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
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
        // setError(true);
        setErrorMessage(errorData.message);
        return;
      }

      await login();
      navigate("/me");
    } catch (error) {
      console.error("에러 내용:", error);
      alert("로그인 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
    }
    console.log(loginData, "로그인 성공");
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        <h2 className={classes.title}>내 계정으로 로그인</h2>
        <div className={classes["login-email-wrapper"]}>
          <label htmlFor="email" className={classes["login-email-label"]}>
            이메일
          </label>
          <input
            required
            type="email"
            id="email"
            name="email"
            value={loginData.email}
            className={classes["login-email-input"]}
            onChange={inputChangeHandler}
          />
        </div>

        <div className={classes["login-password-wrapper"]}>
          <label htmlFor="password" className={classes["login-password-label"]}>
            비밀번호
          </label>
          <input
            required
            type="password"
            id="password"
            name="password"
            value={loginData.password}
            className={classes["login-password-input"]}
            onChange={inputChangeHandler}
          />
        </div>
        <p className={classes["error-message"]}>{errorMessage}</p>
        <button type="submit" className={classes["login-button"]}>
          로그인
        </button>
      </form>
      <div className={classes["signup-wrapper"]}>
        계정이 필요한가요?
        <button onClick={signupMoveHandler} className={classes.signup}>
          가입하기
        </button>
      </div>
    </>
  );
};

export default Login;
