import { GroupChatUserData } from "../../types";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({
  nickname,
  avatarColor,
  avatarImageUrl,
  onlineChecked,
}: Pick<
  GroupChatUserData,
  "nickname" | "avatarColor" | "avatarImageUrl" | "onlineChecked"
>) => {
  return (
    <div className={classes["group-chat-user"]}>
      {avatarImageUrl ? (
        <img
          className={`${classes.avatar} ${
            onlineChecked ? "" : classes.offline
          }`}
          src={avatarImageUrl}
        />
      ) : (
        <div
          className={`${classes.avatar} ${
            onlineChecked ? "" : classes.offline
          }`}
          style={{ backgroundColor: avatarColor || "#ccc" }}
        >
          {nickname.charAt(0)}
          <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          />
        </div>
      )}

      <div
        className={`${classes["group-chat-user-nickname"]} ${
          onlineChecked ? "" : classes.offline
        }`}
      >
        {nickname}
      </div>
    </div>
  );
};

export default GroupChatUser;
