import { GroupChatUserProps } from "../../types";
import Avatar from "../Users/Avatar";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({
  _id,
  nickname,
  avatarColor,
  avatarImageUrl,
  onlineChecked,
  onOpenUserProfile,
}: GroupChatUserProps) => {
  const clickUserProfileHandler = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();

    // event.stopPropagation();

    onOpenUserProfile(
      _id,
      {
        top: rect.top,
        left: rect.right + 10,
        // transform: transform: "translateX(calc(-100% - 10px))",
      },
      "users"
    );
  };

  return (
    <div
      className={`${classes["group-chat-user"]} user-profile-trigger`}
      onClick={clickUserProfileHandler}
    >
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
