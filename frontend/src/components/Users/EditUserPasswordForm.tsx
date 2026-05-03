import { useState } from "react";
import useAuthStore from "../../store/authStore";
// import { ModalProps } from "../../types";
// import Modal from "../UI/Modal";

import classes from "./EditUserPasswordForm.module.css";

interface PasswordEditDataType {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface onBackType {
  onBack: () => void;
}

const EditUserPasswordForm = ({ onBack }: onBackType) => {
  const { editUserPasswordForm } = useAuthStore();

  const [passwordEditData, setPasswordEditData] =
    useState<PasswordEditDataType>({
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    });

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = event.target;
    setPasswordEditData({ ...passwordEditData, [name]: value });
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    // const passwordEditResult = await editUserPasswordForm(passwordEditData);

    await editUserPasswordForm(passwordEditData);
  };

  return (
    // <Modal onToggle={onToggle}>
    <form className={classes["password-edit-wrapper"]} onSubmit={submitHandler}>
      <button type="button" onClick={onBack}>
        뒤로 가기
      </button>
      <h2>비밀번호 변경</h2>
      <p>현재 비밀번호와 새 비밀번호를 입력하세요.</p>
      <label htmlFor="password">현재 비밀번호</label>
      <input
        type="password"
        id="password"
        name="password"
        value={passwordEditData.password}
        onChange={inputChangeHandler}
      />
      <label htmlFor="new-password">새 비밀번호</label>
      <input
        type="password"
        id="new-password"
        name="newPassword"
        value={passwordEditData.newPassword}
        onChange={inputChangeHandler}
      />
      <label htmlFor="confirm-new-password">새 비밀번호 확인</label>
      <input
        type="password"
        id="confirm-new-password"
        name="confirmNewPassword"
        value={passwordEditData.confirmNewPassword}
        onChange={inputChangeHandler}
      />
      <button type="submit">변경</button>
    </form>
    // </Modal>
  );
};

export default EditUserPasswordForm;
