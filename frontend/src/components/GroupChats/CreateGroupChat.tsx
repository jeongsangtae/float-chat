import AuthModal from "../UI/AuthModal";

interface CreateGroupChatProps {
  onToggle: () => void;
}

const CreateGroupChat: React.FC<CreateGroupChatProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>방 추가 모달</AuthModal>;
};

export default CreateGroupChat;
