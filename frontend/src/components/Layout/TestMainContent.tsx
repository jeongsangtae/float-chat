import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

import { ChildrenProps } from "../../types";

import Login from "../Users/Login";

import classes from "./TestMainContent.module.css";

const TestMainContent = ({ children }: ChildrenProps) => {
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
      <div className={classes.backdrop}>
        <div className={classes.modal}>
          {/* <Login onToggle={toggleHandler} /> */}
          {children}
          {/* <Login /> */}
        </div>
      </div>
    </>
  );
};

export default TestMainContent;
