import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useFriendStore from "../../store/friendStore";
import useLayoutStore from "../../store/layoutStore";

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
  const { setView, setGroupChatTitle } = useLayoutStore();

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

  useEffect(() => {
    setView("groupChat");
    setGroupChatTitle(groupChat?.title ?? "");
  }, [groupChat?.title]);

  return (
    <div className={classes["group-chat-details"]}>
      <div className={classes["group-chat-sidebar"]}>
        <button onClick={toggleHandler}>친구 초대 버튼</button>
        {/* {groupChat?.title} */}
        <div>
          참여자 목록 <GroupChatUsers roomId={roomId} />
        </div>
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
