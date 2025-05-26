import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

const EditNicknameForm = ({ onToggle }: ModalProps) => {
  return (
    <Modal onToggle={onToggle}>
      <form>
        <h2>사용자 닉네임 변경</h2>
      </form>
    </Modal>
  );
};

export default EditNicknameForm;
