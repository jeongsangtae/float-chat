import AuthModal from "../UI/AuthModal";
import { IModalProps } from "../../types";

const Signup: React.FC<IModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>회원가입 모달</AuthModal>;
};

export default Signup;
