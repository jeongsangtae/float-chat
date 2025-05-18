import { useNavigate } from "react-router-dom";

import { ChildrenProps } from "../../types";

import DirectChatSidebar from "./DirectChatSidebar";

import useAuthStore from "../../store/authStore";

import classes from "./DirectChatMainContent.module.css";

const DirectChatMainContent = ({ children }: ChildrenProps) => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuthStore();

  // 함수 이름 변경 필요
  const friendToggleHandler = (): void => {
    navigate("/me");
  };

  return (
    <>
      {isLoggedIn && (
        <div className={classes["full-content"]}>
          {/* <div className={classes["sub-sidebar"]}> */}
          <DirectChatSidebar onFriendToggle={friendToggleHandler} />
          {/* </div> */}
          <div className={classes["main-content"]}>{children}</div>
        </div>
      )}
    </>
  );
};

export default DirectChatMainContent;
