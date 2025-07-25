import { ChatsProps } from "../../types";

import classes from "./DirectChatPanel.module.css";

const DirectChatPanel = ({ chatInfo }: Pick<ChatsProps, "chatInfo">) => {
  return (
    <div className={classes["direct-chat-panel"]}>
      <div>
        <div
          className={classes.avatar}
          style={{ backgroundColor: chatInfo.avatarColor }}
        >
          {chatInfo.nickname?.charAt(0)}
        </div>
        <h3 className={classes.nickname}>{chatInfo.nickname}</h3>
      </div>
    </div>
  );
};

export default DirectChatPanel;
