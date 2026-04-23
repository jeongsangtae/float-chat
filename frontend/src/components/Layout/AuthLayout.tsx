import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ToastContainer } from "react-toastify";

import useAuthStore from "../../store/authStore";

import { ChildrenProps } from "../../types";

import classes from "./AuthLayout.module.css";

import background from "../../assets/background4.png";

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
      <div
        className={classes.backdrop}
        style={{
          backgroundImage: `url(${background})`,
        }}
      >
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
        />
        <div className={classes.modal}>{children}</div>
      </div>
    </>
  );
};

export default AuthLayout;
