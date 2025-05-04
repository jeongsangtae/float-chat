import { useEffect } from "react";

import DirectChat from "./DirectChat";
import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useDirectChatStore from "../../store/directChatStore";
import useFriendStore from "../../store/friendStore";
import GroupChatInviteList from "../GroupChats/GroupChatInviteList";

// import classes from "./DirectChats.module.css";

const DirectChats = () => {
  const { isLoggedIn, userInfo } = useAuthStore();
  const { getGroupChatInvites, groupChatInvites } = useGroupChatStore();
  const { directChats, getDirectChat } = useDirectChatStore();
  const { onlineFriends, loadOnlineFriends } = useFriendStore();

  useEffect(() => {
    if (isLoggedIn) {
      getGroupChatInvites();
      getDirectChat();
      loadOnlineFriends();
    }
  }, [isLoggedIn]);

  const onlineFriendIds = onlineFriends.map((friend) =>
    friend.requester.id === userInfo?._id
      ? friend.receiver.id
      : friend.requester.id
  );

  const filteredDirectChats = directChats.map((directChat) => {
    const otherUser = directChat.participants.find(
      (participant) => participant._id !== userInfo?._id
    );

    const onlineChecked = onlineFriendIds.includes(otherUser?._id ?? "");

    return {
      ...directChat,
      otherUser,
      onlineChecked,
    };
  });

  return (
    <>
      <div>
        {filteredDirectChats.map((filteredDirectChat) => (
          <DirectChat
            key={filteredDirectChat._id}
            _id={filteredDirectChat._id}
            otherUserId={filteredDirectChat.otherUser?._id ?? ""}
            otherUserNickname={
              filteredDirectChat.otherUser?.nickname ?? "알 수 없음"
            }
            onlineChecked={filteredDirectChat.onlineChecked}
          />
        ))}
      </div>

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
  );
};

export default DirectChats;
