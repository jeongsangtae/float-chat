import { useNavigate } from "react-router-dom";

import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

const GroupChatConfirm = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();
  const { deleteGroupChat } = useGroupChatStore();

  const navigate = useNavigate();

  console.log(modalData);

  const confirmHandler = () => {
    deleteGroupChat(modalData._id);
    onToggle();
    navigate("/me");

    console.log("그룹 채팅방 삭제 성공");
  };

  return (
    <Modal onToggle={onToggle}>
      <div>
        <h2>그룹 채팅방 삭제</h2>
        <p>정말 그룹 채팅방을 삭제하시겠습니까?</p>
        <div>
          <button onClick={confirmHandler}>삭제</button>
          <button onClick={onToggle}>취소</button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupChatConfirm;
