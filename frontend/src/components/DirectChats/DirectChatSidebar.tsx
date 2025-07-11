import DirectChats from "./DirectChats";
import { FaUserFriends } from "react-icons/fa";

import classes from "./DirectChatSidebar.module.css";
import useFriendStore from "../../store/friendStore";

interface DirectChatSidebarProps {
  onFriendToggle: () => void;
}

const DirectChatSidebar = ({ onFriendToggle }: DirectChatSidebarProps) => {
  const { friendRequests } = useFriendStore();
  return (
    <div className={classes["sub-sidebar"]}>
      <div className={classes.friend} onClick={onFriendToggle}>
        <div className={classes["friend-left"]}>
          <div className={classes["friend-icon"]}>
            <FaUserFriends />
          </div>
          <span className={classes["friend-text"]}>친구</span>
        </div>
        <div className={classes["friend-right"]}>
          {friendRequests.length > 0 && (
            <span className={classes["friend-request-count"]}>
              {friendRequests.length > 99 ? "99+" : friendRequests.length}
            </span>
          )}
        </div>
      </div>
      다이렉트 채팅방
      <DirectChats />
    </div>
  );
};

export default DirectChatSidebar;
