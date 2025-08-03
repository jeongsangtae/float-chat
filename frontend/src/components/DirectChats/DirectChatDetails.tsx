import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import useLayoutStore from "../../store/layoutStore";
import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useDirectChatStore from "../../store/directChatStore";
import useGroupChatStore from "../../store/groupChatStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

import classes from "./DirectChatDetails.module.css";
import DirectChatPanel from "./DirectChatPanel";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { setView } = useLayoutStore();
  const { userInfo } = useAuthStore();
  const {
    friends,
    loadFriends,
    otherUserFriends,
    onlineFriends,
    loadOtherUserFriends,
  } = useFriendStore();
  const { directChats } = useDirectChatStore();
  const { groupChats } = useGroupChatStore();

  const directChat = directChats.find(
    (directChat) => directChat._id === roomId
  );

  const otherUser = directChat?.participants.find(
    (participant) => participant._id !== userInfo?._id
  );

  console.log(otherUser?._id);

  useEffect(() => {
    setView("directChat");
    loadFriends();
  }, []);

  // useEffect(() => {
  //   if (otherUser?._id) {
  //     loadOtherUserFriends(otherUser?._id);
  //   }
  // }, [otherUser?._id]);

  const otherUserFriendIds = useMemo(() => {
    if (!otherUserFriends || !otherUser?._id) return [];

    return (
      otherUserFriends?.map((otherUserFriend) => {
        return otherUserFriend.requester.id === otherUser?._id
          ? otherUserFriend.receiver.id
          : otherUserFriend.requester.id;
      }) ?? []
    );
  }, [otherUserFriends, otherUser?._id]);

  console.log(otherUserFriendIds);

  const friendSince = useMemo(() => {
    const friendSinceDateStr = friends.find((friend) => {
      return (
        (friend.requester.id === userInfo?._id &&
          friend.receiver.id === otherUser?._id) ||
        (friend.requester.id === otherUser?._id &&
          friend.receiver.id === userInfo?._id)
      );
    })?.date;

    if (!friendSinceDateStr) return null;

    const [friendSinceDate] = friendSinceDateStr.split(" ");
    const [year, month, day] = friendSinceDate.split(".");

    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }, [friends, userInfo?._id, otherUser?._id]);

  const onlineChecked = useMemo(() => {
    return onlineFriends.some((onlineFriend) => {
      const targetId =
        onlineFriend.requester.id === userInfo?._id
          ? onlineFriend.receiver.id
          : onlineFriend.requester.id;
      return targetId === otherUser?._id;
    });
  }, [onlineFriends, userInfo?._id, otherUser?._id]);

  const groupChatsShared = groupChats.filter((groupChat) => {
    if (!userInfo || !otherUser) return false;

    const users = groupChat.users ?? [];

    return users.includes(userInfo._id) && users.includes(otherUser._id);
  });

  console.log(friends);
  console.log(otherUserFriends);

  const userFriendIds = friends.map((friend) => {
    friend.requester._id === userInfo?._id
      ? friend.receiver.id
      : friend.requester.id;
  });

  // const otherUserFriendIds = otherUserFriends.map((otherUserFriend) => {
  //   otherUserFriend.requester._id === otherUser?._id
  //     ? otherUserFriend.receiver.id
  //     : otherUserFriend.requester.id;
  // });

  return (
    <div className={classes["direct-chat-detail-wrapper"]}>
      <div className={classes["direct-chat-area"]}>
        <Chats
          roomId={roomId}
          type="direct"
          chatInfo={{
            nickname: otherUser?.nickname,
            avatarColor: otherUser?.avatarColor,
          }}
        />
        <ChatInput roomId={roomId} />
      </div>

      <DirectChatPanel
        chatInfo={{
          nickname: otherUser?.nickname,
          avatarColor: otherUser?.avatarColor,
        }}
        onlineChecked={onlineChecked}
        friendSince={friendSince ?? ""}
        groupChatsShared={groupChatsShared}
      />
    </div>
  );
};

export default DirectChatDetails;
