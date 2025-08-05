import { DirectChatPanelProps } from "../../types";

import classes from "./DirectChatPanel.module.css";

const DirectChatPanel = ({
  chatInfo,
  onlineChecked,
  friendSince,
  groupChatsShared,
  mutualFriendUsers,
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

        {(groupChatsShared.length || mutualFriendUsers.length) > 0 && (
          <div className={classes["share-content-wrapper"]}>
            {groupChatsShared.length > 0 && (
              <div className={classes["group-chat-share"]}>
                같이 있는 그룹 채팅방 - {groupChatsShared.length}
              </div>
            )}

            {groupChatsShared.length > 0 && mutualFriendUsers.length > 0 && (
              <div className={classes.underline}></div>
            )}

            {mutualFriendUsers.length > 0 && (
              <div className={classes["group-chat-share-friend"]}>
                같이 아는 친구 - {mutualFriendUsers.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChatPanel;
