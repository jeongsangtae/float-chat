import DirectChats from "./DirectChats";

import useAuthStore from "../../store/authStore";

import classes from "./DirectChatSidebar.module.css";

interface DirectChatSidebarProps {
  onFriendToggle: () => void;
}

const DirectChatSidebar = ({ onFriendToggle }: DirectChatSidebarProps) => {
  const { isLoggedIn } = useAuthStore();

  return (
    <>
      {isLoggedIn && (
        <div className={classes["sub-sidebar"]}>
          <button onClick={onFriendToggle}>친구</button>
          <DirectChats />
        </div>
      )}
    </>
  );
};

export default DirectChatSidebar;
