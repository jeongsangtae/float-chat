import { GroupChatUserProps } from "../../types";
import Avatar from "../Users/Avatar";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({
  _id,
  nickname,
  avatarColor,
  avatarImageUrl,
  onlineChecked,
  onToggleUserOverlay,
}: GroupChatUserProps) => {
  // 사용자 클릭 시 프로필 툴팁 위치 계산 후 열기
  const openProfileHandler = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();

    onToggleUserOverlay(
      _id,
      {
        top: rect.top,
        left: rect.right + 10,
      },
      "users",
      "profile"
    );
  };

  const openMemberMenuHandler = (event: React.MouseEvent) => {
    event.preventDefault(); // 브라우저 기본 메뉴 방지

    const rect = event.currentTarget.getBoundingClientRect();

    onToggleUserOverlay(
      _id,
      {
        top: rect.top,
        left: rect.right + 10,
      },
      "users",
      "memberMenu"
    );
  };

  return (
    <div
      className={`${classes["group-chat-user"]} user-profile-trigger`}
      onClick={openProfileHandler}
      onContextMenu={openMemberMenuHandler}
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
