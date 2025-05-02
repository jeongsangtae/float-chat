import { useState } from "react";

import Friends from "../Friends/Friends";
import DirectChats from "./DirectChats";

import useAuthStore from "../../store/authStore";

import classes from "./DirectChatSidebar.module.css";

const DirectChatSidebar = ({ onFriendToggle }) => {
  const { isLoggedIn } = useAuthStore();

  // const [toggleFriend, setToggleFriend] = useState<boolean>(false);

  // const friendToggleHandler = (): void => {
  //   setToggleFriend(!toggleFriend);
  // };
  return (
    <>
      {isLoggedIn && (
        <div className={classes["sub-sidebar"]}>
          <button onClick={onFriendToggle}>친구</button>
          {/* <Friends toggleFriend={toggleFriend} /> */}
          <DirectChats />
        </div>
      )}
    </>
  );
};

export default DirectChatSidebar;
