import { RoomId } from "../../types";

import useGroupChatStore from "../../store/groupChatStore";
import { useEffect } from "react";

const GroupChatUsers = ({ roomId }: RoomId) => {
  const { groupChatUsers, getGroupChatUsers } = useGroupChatStore();

  console.log(roomId);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    getGroupChatUsers(roomId);
  }, []);

  return (
    <>
      {groupChatUsers.map((user) => (
        <>
          <ul key={user._id}>
            <li>{user.nickname}</li>
          </ul>
        </>
      ))}
    </>
  );
};

export default GroupChatUsers;
