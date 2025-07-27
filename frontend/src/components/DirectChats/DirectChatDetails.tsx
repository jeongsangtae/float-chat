import { useEffect } from "react";
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

  const friendSince = (() => {
    const dateStr = friends.find((friend) => {
      return (
        (friend.requester.id === userInfo?._id &&
          friend.receiver.id === otherUser?._id) ||
        (friend.requester.id === otherUser?._id &&
          friend.receiver.id === userInfo?._id)
      );
    })?.date;

    if (!dateStr) return null;

    const [datePart] = dateStr.split(" ");
    const [year, month, day] = datePart.split(".");

    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  })();

  console.log(friendSince);

  const onlineChecked = onlineFriends.some((onlineFriend) => {
    const targetId =
      onlineFriend.requester.id === userInfo?._id
        ? onlineFriend.receiver.id
        : onlineFriend.requester.id;
    return targetId === otherUser?._id;
  });

  return (
    <div className={classes["direct-chat-detail-wrapper"]}>
      <div className={classes["direct-chat-detail-content"]}>
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
      </div>
      <DirectChatPanel
        chatInfo={{
          nickname: otherUser?.nickname,
          avatarColor: otherUser?.avatarColor,
        }}
        friendSince={friendSince}
        onlineChecked={onlineChecked}
      />
    </div>
  );
};

export default DirectChatDetails;
