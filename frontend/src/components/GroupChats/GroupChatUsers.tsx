import { useEffect } from "react";

import useGroupChatStore from "../../store/groupChatStore";
import GroupChatUser from "./GroupChatUser";

import { RoomId } from "../../types";
import classes from "./GroupChatUsers.module.css";

const GroupChatUsers = ({ roomId }: RoomId) => {
  const { groupChatUsers, getGroupChatUsers } = useGroupChatStore();

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    getGroupChatUsers(roomId);
  }, [roomId]);

  const onlineUsers = groupChatUsers.filter(
    (groupChatUser) => groupChatUser.onlineChecked
  );
  const offlineUsers = groupChatUsers.filter(
    (groupChatUser) => !groupChatUser.onlineChecked
  );

  return (
    <>
      <div className={classes["online-users"]}>
        <div className={classes["online-text-wrapper"]}>
          <span className={classes["online-text"]}>온라인</span>
          <span className={classes.line}>ㅡ</span>
          <span>{onlineUsers.length}</span>
        </div>

        {onlineUsers.map((onlineUser) => (
          <GroupChatUser
            key={onlineUser._id}
            nickname={onlineUser.nickname}
            avatarColor={onlineUser.avatarColor}
            onlineChecked={onlineUser.onlineChecked}
          />
        ))}
      </div>

      <div className={classes["offline-users"]}>
        <div className={classes["offline-text-wrapper"]}>
          <span className={classes["offline-text"]}>오프라인</span>
          <span className={classes.line}>ㅡ</span>
          <span>{offlineUsers.length}</span>
        </div>

        {offlineUsers.map((offlineUser) => (
          <GroupChatUser
            key={offlineUser._id}
            nickname={offlineUser.nickname}
            avatarColor={offlineUser.avatarColor}
            onlineChecked={offlineUser.onlineChecked}
          />
        ))}
      </div>
    </>
  );
};

export default GroupChatUsers;
