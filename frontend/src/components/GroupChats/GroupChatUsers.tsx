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
      {groupChatUsers.map((user) => (
        <GroupChatUser key={user._id} nickname={user.nickname} />
      ))}
    </>
  );
};

export default GroupChatUsers;
