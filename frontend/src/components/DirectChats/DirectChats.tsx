import { useEffect } from "react";

import DirectChat from "./DirectChat";
import Friends from "../Friends/Friends";
import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useDirectChatStore from "../../store/directChatStore";
import GroupChatInviteList from "../GroupChats/GroupChatInviteList";

const DirectChats = () => {
  const { isLoggedIn, userInfo } = useAuthStore();
  const { getGroupChatInvites, groupChatInvites } = useGroupChatStore();
  const { directChats, getDirectChat } = useDirectChatStore();

  useEffect(() => {
    if (isLoggedIn) {
      getGroupChatInvites();
      getDirectChat();
    }
  }, [isLoggedIn]);

  const filteredDirectChats = directChats.map((directChat) => ({
    ...directChat,
    otherUser: directChat.participants.find(
      (participant) => participant._id !== userInfo?._id
    ),
  }));

  return (
    <>
      {isLoggedIn && (
        <>
          <Friends />
          {filteredDirectChats.map((filteredDirectChat) => (
            <DirectChat
              key={filteredDirectChat._id}
              _id={filteredDirectChat._id}
              otherUserId={filteredDirectChat.otherUser?._id ?? ""}
              otherUserNickname={
                filteredDirectChat.otherUser?.nickname ?? "알 수 없음"
              }
            />
          ))}

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
        </>
      )}
    </>
  );
};

export default DirectChats;
