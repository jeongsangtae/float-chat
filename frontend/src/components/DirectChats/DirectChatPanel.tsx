import { DirectChatPanelProps } from "../../types";

import classes from "./DirectChatPanel.module.css";

const DirectChatPanel = ({
  chatInfo,
  onlineChecked,
  friendSince,
  groupChatsShared,
}: DirectChatPanelProps) => {
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

        {friendSince ? (
          <div className={classes["friend-since-wrapper"]}>
            <div className={classes["friend-since-label"]}>친구 시작일:</div>
            <div className={classes["friend-since"]}>{friendSince}</div>
          </div>
        ) : (
          <div className={classes["not-friend"]}>친구가 아닌 사용자</div>
        )}

        {groupChatsShared && (
          <div>같이 있는 서버 - {groupChatsShared.length}</div>
        )}
      </div>
    </div>
  );
};

export default DirectChatPanel;
