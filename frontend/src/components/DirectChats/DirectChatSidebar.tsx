import DirectChats from "./DirectChats";

import classes from "./DirectChatSidebar.module.css";

interface DirectChatSidebarProps {
  onFriendToggle: () => void;
}

const DirectChatSidebar = ({ onFriendToggle }: DirectChatSidebarProps) => {
  return (
    <div className={classes["sub-sidebar"]}>
      <button onClick={onFriendToggle}>친구</button>
      <DirectChats />
    </div>
  );
};

export default DirectChatSidebar;
