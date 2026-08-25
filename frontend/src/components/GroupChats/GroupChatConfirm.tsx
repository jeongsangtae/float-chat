import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { IoIosSearch } from "react-icons/io";
import { IoClose } from "react-icons/io5";

import Avatar from "../Users/Avatar";

import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import Modal from "../UI/Modal";

import { ModalProps } from "../../types";

import classes from "./GroupChatConfirm.module.css";

const GroupChatConfirm = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();
  const { deleteGroupChat, leaveGroupChat, groupChatUsers, getGroupChatUsers } =
    useGroupChatStore();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedNewHostId, setSelectedNewHostId] = useState<string | null>(
    null
  );

  const hostCandidates = groupChatUsers.filter(
    (user) => user._id !== modalData.userId
  );

  // 검색어에 맞는 사용자 목록 필터링
  const searchUsers = hostCandidates.filter(
    (hostCandidate) =>
      hostCandidate.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostCandidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 그룹 채팅방 삭제 또는 나가기 처리
  const confirmHandler = async () => {
    if (modalData.type === "delete") {
      await deleteGroupChat(modalData._id);
    } else {
      await leaveGroupChat(modalData._id);
    }

    localStorage.removeItem(`prevMessagesLength-${modalData._id}`);

    onToggle();
    navigate("/me");
  };

  useEffect(() => {
    if (
      modalData._id &&
      modalData.type === "leave" &&
      modalData.currentUserRole === "host"
    ) {
      getGroupChatUsers(modalData._id);
    }
  }, [
    modalData._id,
    modalData.type,
    modalData.currentUserRole,
    getGroupChatUsers,
  ]);

  return (
    <Modal onToggle={onToggle}>
      <div className={classes["group-chat-confirm"]}>
        <h2 className={classes.title}>
          그룹 채팅방 {modalData.type === "delete" ? "삭제" : "나가기"}
        </h2>
        <p className={classes.message}>
          정말 그룹 채팅방을 {modalData.type === "delete" ? "삭제하" : "나가"}
          시겠습니까?
        </p>

        <div className={classes["group-chat-confirm-search"]}>
          <input
            type="text"
            className={classes["group-chat-confirm-search-input"]}
            placeholder="사용자 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <IoClose
              className={classes["group-chat-confirm-search-delete-icon"]}
              onClick={() => setSearchTerm("")}
            />
          ) : (
            <IoIosSearch
              className={classes["group-chat-confirm-search-icon"]}
            />
          )}
        </div>
        {modalData.currentUserRole === "host" && (
          <ul>
            {searchUsers.map((user) => (
              <li
                key={user._id}
                className={
                  selectedNewHostId === user._id ? classes["selected"] : ""
                }
                onClick={() => setSelectedNewHostId(user._id)}
              >
                <div>{user.nickname}</div>
                <Avatar
                  nickname={user.nickname}
                  avatarImageUrl={user.avatarImageUrl}
                  avatarColor={user.avatarColor}
                />
              </li>
            ))}
          </ul>
        )}

        <div className={classes["button-wrapper"]}>
          <button
            className={classes["confirm-button"]}
            onClick={confirmHandler}
          >
            {modalData.type === "delete" ? "삭제" : "나가기"}
          </button>
          <button className={classes["cancel-button"]} onClick={onToggle}>
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupChatConfirm;
