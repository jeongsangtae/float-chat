import { useState } from "react";
import { useParams } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useFriendStore from "../../store/friendStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";
import GroupChatInvite from "./GroupChatInvite";
import GroupChatUsers from "./GroupChatUsers";
import Modal from "../UI/Modal";

import classes from "./GroupChatDetails.module.css";

const GroupChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { userInfo } = useAuthStore();
  const { groupChats } = useGroupChatStore();
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

  const groupChat = groupChats.find((groupChat) => groupChat._id === roomId);

  return (
    <div className={classes["group-chat-details"]}>
      <div className={classes["group-chat-sidebar"]}>
        {groupChat?.title}'s server
        <div>
          참여자 목록 <GroupChatUsers roomId={roomId} />
        </div>
        <button onClick={toggleHandler}>친구 초대 버튼</button>
      </div>

      {toggle && (
        <Modal onToggle={toggleHandler}>
          {filteredFriends.map((friend) => (
            <GroupChatInvite
              key={friend.id}
              roomId={roomId}
              friendId={friend.id}
              nickname={friend.nickname}
              onToggle={toggleHandler}
            />
          ))}
        </Modal>
      )}

      <div className={classes["group-chat-content"]}>
        <Chats roomId={roomId} />
        <ChatInput roomId={roomId} />
      </div>
    </div>
  );
};

export default GroupChatDetails;
