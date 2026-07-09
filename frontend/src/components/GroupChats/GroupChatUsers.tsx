import GroupChatUser from "./GroupChatUser";

import { GroupChatUsersProps } from "../../types";

import classes from "./GroupChatUsers.module.css";

const GroupChatUsers = ({
  groupChatUsers,
  onOpenUserProfile,
}: GroupChatUsersProps) => {
  // 온라인 사용자 목록
  const onlineUsers = groupChatUsers.filter(
    (groupChatUser) => groupChatUser.onlineChecked
  );

  // 오프라인 사용자 목록
  const offlineUsers = groupChatUsers.filter(
    (groupChatUser) => !groupChatUser.onlineChecked
  );

  return (
    <>
      {/* 온라인 사용자 */}
      <div className={classes["online-users"]}>
        <div className={classes["online-text-wrapper"]}>
          <span className={classes["online-text"]}>온라인</span>
          <span className={classes.line}>ㅡ</span>
          <span>{onlineUsers.length}</span>
        </div>

        {onlineUsers.map((onlineUser) => (
          <GroupChatUser
            key={onlineUser._id}
            _id={onlineUser._id}
            nickname={onlineUser.nickname}
            avatarColor={onlineUser.avatarColor}
            avatarImageUrl={onlineUser.avatarImageUrl}
            onlineChecked={onlineUser.onlineChecked}
            onOpenUserProfile={onOpenUserProfile}
          />
        ))}
      </div>

      {/* 오프라인 사용자 */}
      <div className={classes["offline-users"]}>
        <div className={classes["offline-text-wrapper"]}>
          <span className={classes["offline-text"]}>오프라인</span>
          <span className={classes.line}>ㅡ</span>
          <span>{offlineUsers.length}</span>
        </div>

        {offlineUsers.map((offlineUser) => (
          <GroupChatUser
            key={offlineUser._id}
            _id={offlineUser._id}
            nickname={offlineUser.nickname}
            avatarColor={offlineUser.avatarColor}
            avatarImageUrl={offlineUser.avatarImageUrl}
            onlineChecked={offlineUser.onlineChecked}
            onOpenUserProfile={onOpenUserProfile}
          />
        ))}
      </div>
    </>
  );
};

export default GroupChatUsers;
