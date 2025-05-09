import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

import Login from "../Users/Login";

const TestMainContent = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/me", { replace: true });
    }
  }, [isLoggedIn]);

  const [toggle, setToggle] = useState<boolean>(false);

  // 이름 변경 필요
  const toggleHandler = (): void => {
    setToggle(!toggle);
  };

  return (
    <>
      <div>비로그인 상태의 메인 콘텐츠 내용</div>
      <Login onToggle={toggleHandler} />
    </>
  );
};

export default TestMainContent;
