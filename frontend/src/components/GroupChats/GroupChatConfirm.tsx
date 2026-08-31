import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

  // 자신을 제외한 호스트 위임할 목록
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
    } else if (modalData.currentUserRole === "host") {
      if (!selectedNewHostId) {
        toast.error("호스트 권한을 넘길 사용자를 선택해주세요.");
        return;
      }

      await leaveGroupChat(modalData._id, selectedNewHostId);
    } else {
      await leaveGroupChat(modalData._id);
    }

    localStorage.removeItem(`prevMessagesLength-${modalData._id}`);

    onToggle();
    navigate("/me");
  };

  // 그룹 채팅방 삭제 또는 나가기 버튼 클릭 시 사용자 목록 호출
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

        {modalData.type === "leave" && modalData.currentUserRole === "host" && (
          <>
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
            {searchUsers.length > 0 ? (
              <ul className={classes["group-chat-confirm-users"]}>
                {searchUsers.map((user) => (
                  <li
                    key={user._id}
                    className={`${classes["group-chat-confirm-user"]} ${
                      selectedNewHostId === user._id ? classes["selected"] : ""
                    }`}
                    onClick={() => setSelectedNewHostId(user._id)}
                  >
                    <div className={classes["group-chat-confirm-user-info"]}>
                      <Avatar
                        nickname={user.nickname}
                        avatarImageUrl={user.avatarImageUrl}
                        avatarColor={user.avatarColor}
                      />
                      <div
                        className={classes["group-chat-confirm-user-nickname"]}
                      >
                        {user.nickname}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : hostCandidates.length === 0 ? (
              <div className={classes["group-chat-confirm-error-message"]}>
                호스트를 위임할 사용자가 없습니다. <br />
                새로고침 후 다시 시도해주세요.
              </div>
            ) : (
              <div className={classes["group-chat-confirm-not-search-message"]}>
                검색 결과가 없습니다.
              </div>
            )}
          </>
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
