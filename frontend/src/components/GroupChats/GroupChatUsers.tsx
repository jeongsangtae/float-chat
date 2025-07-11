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

  return (
    <>
      {groupChatUsers.map((groupChatUser) => (
        <GroupChatUser
          key={groupChatUser._id}
          nickname={groupChatUser.nickname}
          avatarColor={groupChatUser.avatarColor}
          onlineChecked={groupChatUser.onlineChecked}
        />
      ))}
    </>
  );
};

export default GroupChatUsers;
