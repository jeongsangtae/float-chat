import { useNavigate } from "react-router-dom";

import { ChildrenProps } from "../../types";

import DirectChatSidebar from "./DirectChatSidebar";

import useAuthStore from "../../store/authStore";

import classes from "./DirectChatMainContent.module.css";
import NoAccess from "../Users/NoAccess";

const DirectChatMainContent = ({ children }: ChildrenProps) => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuthStore();

  // 함수 이름 변경 필요
  const friendToggleHandler = (): void => {
    navigate("/me");
  };

  return (
    <>
      {isLoggedIn ? (
        <div className={classes["direct-chat-full-content"]}>
          <DirectChatSidebar onFriendToggle={friendToggleHandler} />
          <div className={classes["direct-chat-main-content"]}>{children}</div>
        </div>
      ) : (
        <>
          <NoAccess
            title="로그인이 필요합니다."
            description="로그인 하지 않은 사용자는 접근할 수 없습니다."
            label="로그인 하러가기"
            path="/login"
          />
        </>
      )}
    </>
  );
};

export default DirectChatMainContent;
