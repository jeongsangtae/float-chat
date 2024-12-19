import React, { ReactNode } from "react";
import classes from "./AuthModal.module.css";

interface AuthModalProps {
  children: ReactNode;
  onToggle: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ children, onToggle }) => {
  return (
    <>
      <div className={classes.backdrop} onClick={onToggle} />
      <dialog open className={classes.modal}>
        {children}
      </dialog>
    </>
  );
};

export default AuthModal;
