import AuthModal from "../UI/AuthModal";
import { ModalProps } from "../../types";

const Login = ({ onToggle }: ModalProps) => {
  return <AuthModal onToggle={onToggle}>로그인 모달</AuthModal>;
};

export default Login;
