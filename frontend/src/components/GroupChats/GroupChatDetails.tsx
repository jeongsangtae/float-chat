import { useState } from "react";
import { useParams } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";
import GroupChatInvite from "./GroupChatInvite";

const GroupChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { userInfo } = useAuthStore();
  const { friends, loadFriends } = useFriendStore();

  const [toggle, setToggle] = useState(false);

  const toggleHandler = () => {
    setToggle(!toggle);
    loadFriends();
  };

  const userId = userInfo?._id;

  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  console.log(filteredFriends);
  console.log(filteredFriends[0].nickname);

  return (
    <>
      <button onClick={toggleHandler}>친구 초대 버튼</button>
      {toggle &&
        filteredFriends.map((friend) => (
          <GroupChatInvite key={friend.id} nickname={friend.nickname} />
        ))}
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </>
  );
};

export default GroupChatDetails;
