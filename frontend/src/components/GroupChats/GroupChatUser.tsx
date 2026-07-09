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
  // 사용자 클릭 시 프로필 툴팁 위치 계산 후 열기
  const clickUserProfileHandler = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();

    onOpenUserProfile(
      _id,
      {
        top: rect.top,
        left: rect.right + 10,
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
