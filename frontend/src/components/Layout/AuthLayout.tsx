import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

import { ChildrenProps } from "../../types";

import classes from "./AuthLayout.module.css";

const AuthLayout = ({ children }: ChildrenProps) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/me", { replace: true });
    }
  }, [isLoggedIn]);

  return (
    <>
      <div className={classes.backdrop}>
        <div className={classes.modal}>{children}</div>
      </div>
    </>
  );
};

export default AuthLayout;
