import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

const GroupChatAnnouncementForm = ({ onToggle }: ModalProps) => {
  return (
    <Modal onToggle={onToggle}>
      <form>
        <h2>그룹 채팅방 공지</h2>
        <p>호스트 전용 공간</p>
        <input />
      </form>
    </Modal>
  );
};

export default GroupChatAnnouncementForm;
