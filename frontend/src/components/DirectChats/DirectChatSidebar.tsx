import Friends from "../Friends/Friends";
import DirectChats from "./DirectChats";

import useAuthStore from "../../store/authStore";

import classes from "./DirectChatSidebar.module.css";

const DirectChatSidebar = () => {
  const { isLoggedIn } = useAuthStore();
  return (
    <>
      {isLoggedIn && (
        <div className={classes["sub-sidebar"]}>
          <Friends />
          <DirectChats />
        </div>
      )}
    </>
  );
};

export default DirectChatSidebar;
