import { useLocation } from "react-router-dom";

import DirectChats from "./DirectChats";
import { FaUserFriends } from "react-icons/fa";

import useFriendStore from "../../store/friendStore";
import useAuthStore from "../../store/authStore";

import classes from "./DirectChatSidebar.module.css";

interface DirectChatSidebarProps {
  onFriendToggle: () => void;
}

const DirectChatSidebar = ({ onFriendToggle }: DirectChatSidebarProps) => {
  const location = useLocation();

  const active = location.pathname === `/me`;

  const { userInfo } = useAuthStore();
  const { friendRequests } = useFriendStore();

  const receiverRequests = friendRequests.filter(
    (friendRequest) => friendRequest.receiver === userInfo?._id
  );

  return (
    <div className={classes["sub-sidebar"]}>
      <div
        className={`${classes.friend} ${active ? classes.active : ""}`}
        onClick={onFriendToggle}
      >
        <div className={classes["friend-left"]}>
          <div className={classes["friend-icon"]}>
            <FaUserFriends />
          </div>
          <span className={classes["friend-text"]}>친구</span>
        </div>

        {receiverRequests.length > 0 && (
          <div className={classes["friend-right"]}>
            <span className={classes["friend-request-count"]}>
              {receiverRequests.length > 99 ? "99" : receiverRequests.length}
            </span>
          </div>
        )}
      </div>
      <div className={classes.underline}></div>
      <div className={classes["direct-chat-text"]}>다이렉트 채팅방</div>
      <DirectChats />
    </div>
  );
};

export default DirectChatSidebar;
