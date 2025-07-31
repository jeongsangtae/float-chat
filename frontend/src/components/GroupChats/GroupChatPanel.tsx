import classes from "./GroupChatPanel.module.css";

import { GroupChatPanelProps } from "../../types";
const GroupChatPanel = ({
  groupChatSince,
  hostNickname,
  hostAvatarColor,
}: GroupChatPanelProps) => {
  return (
    <div className={classes["group-chat-panel"]}>
      <div
        className={classes["avatar-header"]}
        style={{ backgroundColor: hostAvatarColor }}
      ></div>

      <div className={classes["group-chat-host-info"]}>
        <div
          className={classes.avatar}
          style={{ backgroundColor: hostAvatarColor }}
        >
          {hostNickname?.charAt(0)}
          {/* <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          /> */}
        </div>
        <h3 className={classes.nickname}>{hostNickname}</h3>

        <div className={classes["group-chat-since-wrapper"]}>
          <div className={classes["group-chat-since-label"]}>
            그룹 채팅방 생성일:
          </div>
          <div className={classes["group-chat-since"]}>{groupChatSince}</div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatPanel;
