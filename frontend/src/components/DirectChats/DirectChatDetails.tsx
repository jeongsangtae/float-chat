import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import useLayoutStore from "../../store/layoutStore";
import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useDirectChatStore from "../../store/directChatStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

import classes from "./DirectChatDetails.module.css";
import DirectChatPanel from "./DirectChatPanel";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { setView } = useLayoutStore();
  const { userInfo } = useAuthStore();
  const { friends, loadFriends, onlineFriends } = useFriendStore();
  const { directChats } = useDirectChatStore();

  useEffect(() => {
    setView("directChat");
    loadFriends();
  }, []);

  const directChat = directChats.find(
    (directChat) => directChat._id === roomId
  );

  const otherUser = directChat?.participants.find(
    (participant) => participant._id !== userInfo?._id
  );

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
      />
    </div>
  );
};

export default DirectChatDetails;
