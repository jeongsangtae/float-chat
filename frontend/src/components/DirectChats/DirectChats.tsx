import { useEffect } from "react";

import DirectChat from "./DirectChat";
import Friends from "../Friends/Friends";
import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import GroupChatInviteList from "../GroupChats/GroupChatInviteList";

const DirectChats = () => {
  const { isLoggedIn } = useAuthStore();
  const { getGroupChatInvites, groupChatInvites } = useGroupChatStore();

  useEffect(() => {
    if (isLoggedIn) {
      getGroupChatInvites();
    }
  }, [isLoggedIn]);

  return (
    <>
      {isLoggedIn && (
        <>
          {/* <p>아이콘 들어갈 위치</p> */}
          <DirectChat />
          {groupChatInvites.map((groupChatInvite) => (
            <GroupChatInviteList
              key={groupChatInvite._id}
              groupChatId={groupChatInvite.roomId}
              groupChatInviteId={groupChatInvite._id}
              requester={groupChatInvite.requester}
              requesterNickname={groupChatInvite.requesterNickname}
              roomTitle={groupChatInvite.roomTitle}
              status={groupChatInvite.status}
            />
          ))}
          <Friends />
        </>
      )}
    </>
  );
};

export default DirectChats;
