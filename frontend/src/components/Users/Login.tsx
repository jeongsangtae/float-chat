import AuthModal from "../UI/AuthModal";
import { IModalProps } from "../../types";

const Login: React.FC<IModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>로그인 모달</AuthModal>;
};

export default Login;
