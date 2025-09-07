import useModalStore from "../../store/modalStore";
import useGroupChatStore from "../../store/groupChatStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

import classes from "./GroupChatAnnouncementDeleteConfirm.module.css";

const GroupChatAnnouncementDeleteConfirm = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();
  const { groupChatAnnouncementDelete } = useGroupChatStore();

  const confirmHandler = async () => {
    try {
      await groupChatAnnouncementDelete("", modalData); // announcement를 ""로 초기화
      console.log("그룹 채팅방 공지 삭제 성공");
      onToggle();
    } catch (error) {
      console.error("공지 삭제 실패:", error);
      alert("공지 삭제 중 문제가 발생했습니다.");
    }
  };

  return (
    <Modal onToggle={onToggle}>
      <div className={classes["group-chat-announcement-delete-confirm"]}>
        <h2 className={classes.title}>공지사항 삭제</h2>
        <p className={classes.message}>정말 공지사항을 삭제하시겠습니까?</p>
        <div className={classes["button-wrapper"]}>
          <button className={classes["delete-button"]} onClick={confirmHandler}>
            삭제
          </button>
          <button className={classes["cancel-button"]} onClick={onToggle}>
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupChatAnnouncementDeleteConfirm;
