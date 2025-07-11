import { RoomId } from "../../types";

import useGroupChatStore from "../../store/groupChatStore";
import { useEffect } from "react";
import GroupChatUser from "./GroupChatUser";

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
      <div>
        <div>온라인</div>
        {onlineUsers.map((onlineUser) => (
          <GroupChatUser
            key={onlineUser._id}
            nickname={onlineUser.nickname}
            avatarColor={onlineUser.avatarColor}
            onlineChecked={onlineUser.onlineChecked}
          />
        ))}
      </div>
      <div>
        <div>오프라인</div>
        {offlineUsers.map((offlineUsers) => (
          <GroupChatUser
            key={offlineUsers._id}
            nickname={offlineUsers.nickname}
            avatarColor={offlineUsers.avatarColor}
            onlineChecked={offlineUsers.onlineChecked}
          />
        ))}
      </div>
    </>
  );
};

export default GroupChatUsers;
