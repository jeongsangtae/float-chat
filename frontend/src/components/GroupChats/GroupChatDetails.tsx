import { useState } from "react";
import { useParams } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";
import GroupChatInvite from "./GroupChatInvite";
import GroupChatUsers from "./GroupChatUsers";

import classes from "./GroupChatDetails.module.css";

const GroupChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { userInfo } = useAuthStore();
  const { friends, loadFriends } = useFriendStore();

  const [toggle, setToggle] = useState<boolean>(false);

  // 이름 변경 필요
  const toggleHandler = (): void => {
    setToggle(!toggle);
    loadFriends();
  };

  const userId = userInfo?._id;

  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  return (
    <div className={classes["group-chat-details"]}>
      <div className={classes["group-chat-sidebar"]}>
        <GroupChatUsers roomId={roomId} />
        <button onClick={toggleHandler}>친구 초대 버튼</button>
      </div>

      {toggle &&
        filteredFriends.map((friend) => (
          <GroupChatInvite
            key={friend.id}
            roomId={roomId}
            friendId={friend.id}
            nickname={friend.nickname}
          />
        ))}

      <div className={classes["group-chat-content"]}>
        <Chats roomId={roomId} />
        <ChatInput roomId={roomId} />
      </div>
    </div>
  );
};

export default GroupChatDetails;
