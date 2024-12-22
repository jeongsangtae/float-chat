import AuthModal from "../UI/AuthModal";
import { IModalProps } from "../../types";

const CreateGroupChat: React.FC<IModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>방 추가 모달</AuthModal>;
};

export default CreateGroupChat;
