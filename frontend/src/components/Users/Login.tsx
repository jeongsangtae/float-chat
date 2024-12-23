import AuthModal from "../UI/AuthModal";
import { ModalProps } from "../../types";

const Login: React.FC<ModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>로그인 모달</AuthModal>;
};

export default Login;
