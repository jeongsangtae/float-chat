import AuthModal from "../UI/AuthModal";
import { AuthModalProps } from "../../types";

const Login: React.FC<AuthModalProps> = ({ onToggle }) => {
  return <AuthModal onToggle={onToggle}>로그인 모달</AuthModal>;
};

export default Login;
