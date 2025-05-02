import { useState } from "react";

import DirectChatSidebar from "./DirectChatSidebar";

import classes from "./DirectChatMainContent.module.css";
import Friends from "../Friends/Friends";

const DirectChatMainContent = ({ children }) => {
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
