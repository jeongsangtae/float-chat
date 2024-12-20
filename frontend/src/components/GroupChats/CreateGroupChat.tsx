import AuthModal from "../UI/AuthModal";
import { AuthModalProps } from "../../types";

const CreateGroupChat: React.FC<AuthModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>방 추가 모달</AuthModal>;
};

export default CreateGroupChat;
