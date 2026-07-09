import { createPortal } from "react-dom";

import { ModalProps } from "../../types";

import classes from "./Modal.module.css";

// Portal을 이용해 모달 렌더링
const Modal = ({ children, onToggle }: ModalProps) => {
  return createPortal(
    <>
      <div className={classes.backdrop} onClick={onToggle} />
      <dialog open className={classes.modal}>
        {children}
      </dialog>
    </>,
    document.getElementById("modal-portal")!
  );
};

export default Modal;
