import { GroupChatUserData } from "../../types";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({
  nickname,
  avatarColor,
  onlineChecked,
}: Pick<GroupChatUserData, "nickname" | "avatarColor" | "onlineChecked">) => {
  return (
    <div className={classes["group-chat-user"]}>
      <div
        className={classes.avatar}
        style={{ backgroundColor: avatarColor || "#ccc" }}
      >
        {nickname.charAt(0)}
        <div
          className={
            onlineChecked ? classes["online-dot"] : classes["offline-dot"]
          }
        />
      </div>
      <div className={classes["group-chat-user-nickname"]}>{nickname}</div>
    </div>
  );
};

export default GroupChatUser;
