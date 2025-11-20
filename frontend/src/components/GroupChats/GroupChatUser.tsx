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
        extraClass={onlineChecked ? "" : "offline"}
      />

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
