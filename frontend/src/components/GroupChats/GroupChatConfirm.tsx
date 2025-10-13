import { useNavigate } from "react-router-dom";

import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

import classes from "./GroupChatConfirm.module.css";

const GroupChatConfirm = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();
  const { deleteGroupChat, leaveGroupChat } = useGroupChatStore();

  const navigate = useNavigate();

  const confirmHandler = async () => {
    if (modalData.type === "delete") {
      await deleteGroupChat(modalData._id);
      console.log("그룹 채팅방 삭제 성공");
    } else {
      await leaveGroupChat(modalData._id);
      console.log("그룹 채팅방 나가기 성공");
    }
    onToggle();
    navigate("/me");
  };

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
