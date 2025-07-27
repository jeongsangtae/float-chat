import { ChatsProps } from "../../types";

import classes from "./DirectChatPanel.module.css";

const DirectChatPanel = ({
  chatInfo,
  onlineChecked,
  friendSince,
}: Pick<ChatsProps, "chatInfo">) => {
  console.log(onlineChecked, friendSince);

  return (
    <div className={classes["direct-chat-panel"]}>
      <div
        className={classes["avatar-header"]}
        style={{ backgroundColor: chatInfo.avatarColor }}
      ></div>

      <div className={classes["direct-chat-other-info"]}>
        <div
          className={classes.avatar}
          style={{ backgroundColor: chatInfo.avatarColor }}
        >
          {chatInfo.nickname?.charAt(0)}
          <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          />
        </div>
        <h3 className={classes.nickname}>{chatInfo.nickname}</h3>

        <div>
          <div>친구 시작일:</div>
          <div>{friendSince ? friendSince : "친구가 아닌 사용자"}</div>
        </div>
      </div>
    </div>
  );
};

export default DirectChatPanel;
