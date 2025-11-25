import { useState } from "react";

import { GroupChatUserData } from "../../types";
import Avatar from "../Users/Avatar";
import UserProfile from "../Users/UserProfile";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({
  _id,
  nickname,
  avatarColor,
  avatarImageUrl,
  onlineChecked,
}: Omit<GroupChatUserData, "email" | "username" | "date">) => {
  const [toggle, setToggle] = useState<boolean>(false);

  const userProfileHandler = () => {
    setToggle(!toggle);
  };

  return (
    <div className={classes["group-chat-user"]} onClick={userProfileHandler}>
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
      {toggle && (
        <div className={classes["user-profile-tooltip"]}>
          <UserProfile
            userId={_id}
            nickname={nickname}
            avatarImageUrl={avatarImageUrl}
            avatarColor={avatarColor}
            onlineChecked={onlineChecked}
          />
        </div>
      )}
    </div>
  );
};

export default GroupChatUser;
