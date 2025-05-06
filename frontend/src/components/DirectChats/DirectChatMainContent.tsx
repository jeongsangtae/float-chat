import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ChildrenProps } from "../../types";

import DirectChatSidebar from "./DirectChatSidebar";
import Friends from "../Friends/Friends";

import useAuthStore from "../../store/authStore";

import classes from "./DirectChatMainContent.module.css";

const DirectChatMainContent = ({ children }: ChildrenProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn } = useAuthStore();
  const [selectedMainContent, setSeletedMainContent] = useState<
    "friends" | "directChat" | null
  >(null);

  // 함수 이름 변경 필요
  const friendToggleHandler = (): void => {
    navigate("/me");
  };

  useEffect(() => {
    if (location.pathname === "/me") {
      setSeletedMainContent("friends");
    } else if (location.pathname.startsWith("/me/")) {
      setSeletedMainContent("directChat");
    }
  }, [location.pathname]);

  return (
    <>
      {isLoggedIn && (
        <div className={classes["full-content"]}>
          <div className={classes["sub-sidebar"]}>
            <DirectChatSidebar onFriendToggle={friendToggleHandler} />
          </div>
          <div className={classes["main-content"]}>
            {selectedMainContent === "friends" && (
              <Friends toggleFriend={true} />
            )}
            {selectedMainContent === "directChat" && children}
          </div>
        </div>
      )}
    </>
  );
};

export default DirectChatMainContent;
