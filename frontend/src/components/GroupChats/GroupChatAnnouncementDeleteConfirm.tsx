import { toast } from "react-toastify";

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
      onToggle();
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("삭제 실패 - 새로고침 후 다시 시도해주세요");
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
