import { useState, useRef } from "react";

import { createPortal } from "react-dom";

import { GroupChatUserProps } from "../../types";
import Avatar from "../Users/Avatar";
import UserProfile from "../Users/UserProfile";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({
  _id,
  nickname,
  avatarColor,
  avatarImageUrl,
  onlineChecked,
  activeUser,
  onOpenUserProfile,
}: GroupChatUserProps) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const userRef = useRef<HTMLDivElement | null>(null);

  const active = activeUser === _id;

  const userProfileHandler = () => {
    if (!userRef.current) return;

    const rect = userRef.current.getBoundingClientRect();

    setCoords({
      top: rect.top,
      left: rect.right + 10,
    });

    onOpenUserProfile(_id);
  };

  return (
    <div
      className={classes["group-chat-user"]}
      onClick={userProfileHandler}
      ref={userRef}
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
      {active &&
        createPortal(
          <UserProfile
            userId={_id}
            nickname={nickname}
            avatarImageUrl={avatarImageUrl}
            avatarColor={avatarColor}
            onlineChecked={onlineChecked}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
            }}
          />,
          document.getElementById("user-profile-tooltip-portal")!
        )}
    </div>
  );
};

export default GroupChatUser;
