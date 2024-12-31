import { ModalProps } from "../../types";

import classes from "./AuthModal.module.css";

const AuthModal = ({ children, onToggle }: ModalProps) => {
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
