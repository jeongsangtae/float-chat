import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useAuthStore from "../../store/authStore";

import classes from "./Login.module.css";

interface loginDataType {
  email: string;
  password: string;
}

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loginData, setLoginData] = useState<loginDataType>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState<string>("");

  // 회원가입 / 회원탈퇴 완료 메시지 처리
  useEffect(() => {
    if (location.state?.signupSuccess) {
      toast.success("회원가입 성공");
      navigate(location.pathname, { replace: true });
    } else if (location.state?.userDeleteSuccess) {
      toast.success("계정 탈퇴 완료");
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // 로그인 입력 처리
  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = event.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // 회원가입 페이지 이동
  const signupMoveHandler = () => {
    navigate("/signup");
  };

  // 로그인 요청
  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const loginResult = await login(loginData);

    const networkError =
      !loginResult.success && loginResult.type === "NETWORK_ERROR";

    if (networkError) {
      toast.error("네트워크 문제 발생");
      return;
    }

    if (!loginResult.success) {
      setErrorMessage(loginResult.message || "에러 발생");
      return;
    }

    navigate("/me");
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
