import { GroupChatUserData } from "../../types";
import Avatar from "../Users/Avatar";

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
      <Avatar
        nickname={nickname}
        avatarImageUrl={avatarImageUrl}
        avatarColor={avatarColor}
        onlineChecked={onlineChecked}
        showOnlineDot={true}
      />

      {/* {avatarImageUrl ? (
        <div className={classes["avatar-img-wrapper"]}>
          <img
            className={`${classes["avatar-img"]} ${
              onlineChecked ? "" : classes.offline
            }`}
            src={avatarImageUrl}
          />
          <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          />
        </div>
      ) : (
        <div
          className={`${classes["avatar-color"]} ${
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
      )} */}

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
