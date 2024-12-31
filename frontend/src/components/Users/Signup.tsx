import AuthModal from "../UI/AuthModal";
import { ModalProps } from "../../types";

const Signup = ({ onToggle }: ModalProps) => {
  return <AuthModal onToggle={onToggle}>회원가입 모달</AuthModal>;
};

export default Signup;
