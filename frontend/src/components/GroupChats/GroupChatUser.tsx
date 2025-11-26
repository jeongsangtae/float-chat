import { useState, useRef } from "react";

import { createPortal } from "react-dom";

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
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const userRef = useRef(null);

  const userProfileHandler = () => {
    if (!userRef.current) return;

    const rect = userRef.current.getBoundingClientRect();

    setCoords({
      top: rect.top + rect.height / 2, // 가운데 정렬
      left: rect.right + 10, // 오른쪽으로 12px 띄움
    });

    setToggle(!toggle);
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
      {toggle &&
        createPortal(
          // <div className={classes["user-profile-tooltip"]}>
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
          document.getElementById("user-profile-tooltip-portal")
          // </div>
        )}
    </div>
  );
};

export default GroupChatUser;
