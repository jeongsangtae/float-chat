import { ModalProps } from "../../types";

import classes from "./Modal.module.css";

const Modal = ({ children, onToggle }: ModalProps) => {
  return (
    <>
      <div className={classes.backdrop} onClick={onToggle} />
      <dialog open className={classes.modal}>
        {children}
      </dialog>
    </>
  );
};

export default Modal;
