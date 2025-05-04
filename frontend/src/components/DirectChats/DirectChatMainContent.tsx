import { useState } from "react";

import { ChildrenProps } from "../../types";

import DirectChatSidebar from "./DirectChatSidebar";
import Friends from "../Friends/Friends";

import classes from "./DirectChatMainContent.module.css";

const DirectChatMainContent = ({ children }: ChildrenProps) => {
  const [toggleFriend, setToggleFriend] = useState<boolean>(false);

  const friendToggleHandler = (): void => {
    setToggleFriend(!toggleFriend);
  };

  return (
    <div className={classes["full-content"]}>
      <div className={classes["sub-sidebar"]}>
        <DirectChatSidebar onFriendToggle={friendToggleHandler} />
      </div>
      <div className={classes["main-content"]}>
        {toggleFriend && <Friends toggleFriend={toggleFriend} />}
        {children}
      </div>
    </div>
  );
};

export default DirectChatMainContent;
