import AuthModal from "../UI/AuthModal";
import { ModalProps } from "../../types";

const Signup: React.FC<ModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>회원가입 모달</AuthModal>;
};

export default Signup;
