import AuthModal from "../UI/AuthModal";
import { ModalProps } from "../../types";

const CreateGroupChat: React.FC<ModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>방 추가 모달</AuthModal>;
};

export default CreateGroupChat;
