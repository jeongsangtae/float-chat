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
        <div className={classes["direct-chat-full-content"]}>
          <DirectChatSidebar onFriendToggle={friendToggleHandler} />
          <div className={classes["direct-chat-main-content"]}>{children}</div>
        </div>
      )}
    </>
  );
};

export default DirectChatMainContent;
