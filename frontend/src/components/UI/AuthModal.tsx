import React from "react";

import { IModalProps } from "../../types";

import classes from "./AuthModal.module.css";

const AuthModal: React.FC<IModalProps> = ({ children, onToggle }) => {
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
