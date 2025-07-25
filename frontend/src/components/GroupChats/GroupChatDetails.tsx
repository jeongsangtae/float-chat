import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { IoClose, IoPersonAddSharp } from "react-icons/io5";

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
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 이름 변경 필요
  const toggleHandler = (): void => {
    setToggle(!toggle);
    loadFriends();
  };

  const userId = userInfo?._id;

  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  const searchFriends = filteredFriends.filter(
    (friendData) =>
      friendData.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friendData.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupChat = groupChats.find((groupChat) => groupChat._id === roomId);

  useEffect(() => {
    setView("groupChat");
    setGroupChatTitle(groupChat?.title ?? "");
  }, [groupChat?.title]);

  return (
    <div className={classes["group-chat-details"]}>
      <div className={classes["group-chat-sidebar"]}>
        <div
          className={classes["group-chat-invite-button"]}
          onClick={toggleHandler}
        >
          <div className={classes["group-chat-invite-icon"]}>
            <IoPersonAddSharp />
          </div>
          <span className={classes["group-chat-invite-text"]}>초대</span>
        </div>

        <div className={classes.underline}></div>

        <GroupChatUsers roomId={roomId} />
      </div>

      {toggle && (
        <Modal onToggle={toggleHandler}>
          <div className={classes["group-chat-invite-modal-content"]}>
            <div className={classes["group-chat-invite-title"]}>
              친구를 {groupChat?.title} 그룹 채팅방으로 초대하기
            </div>

            <div className={classes["group-chat-invite-search"]}>
              <input
                type="text"
                className={classes["group-chat-invite-search-input"]}
                placeholder="친구 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm ? (
                <IoClose
                  className={classes["group-chat-invite-search-delete-icon"]}
                  onClick={() => setSearchTerm("")}
                />
              ) : (
                <IoIosSearch
                  className={classes["group-chat-invite-search-icon"]}
                />
              )}
            </div>

            <ul className={classes["group-chat-invite"]}>
              {searchFriends.map((friend) => (
                <GroupChatInvite
                  key={friend.id}
                  roomId={roomId ?? ""}
                  friendId={friend.id}
                  nickname={friend.nickname}
                  avatarColor={friend.avatarColor}
                  onToggle={toggleHandler}
                />
              ))}
            </ul>
          </div>
        </Modal>
      )}

      <div className={classes["group-chat-content"]}>
        <Chats
          roomId={roomId}
          type="group"
          chatInfo={{
            title: groupChat?.title,
          }}
        />
        <ChatInput roomId={roomId} />
      </div>
    </div>
  );
};

export default GroupChatDetails;
