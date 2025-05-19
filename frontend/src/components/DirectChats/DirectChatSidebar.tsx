import DirectChats from "./DirectChats";

import classes from "./DirectChatSidebar.module.css";

interface DirectChatSidebarProps {
  onFriendToggle: () => void;
}

const DirectChatSidebar = ({ onFriendToggle }: DirectChatSidebarProps) => {
  return (
    <div className={classes["sub-sidebar"]}>
      <button onClick={onFriendToggle}>친구</button>
      다이렉트 채팅방
      <DirectChats />
    </div>
  );
};

export default DirectChatSidebar;
