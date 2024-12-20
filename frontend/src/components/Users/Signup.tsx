import AuthModal from "../UI/AuthModal";
import { AuthModalProps } from "../../types";

const Signup: React.FC<AuthModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>회원가입 모달</AuthModal>;
};

export default Signup;
