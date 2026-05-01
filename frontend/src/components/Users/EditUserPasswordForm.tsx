import useAuthStore from "../../store/authStore";
import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

import classes from "./EditUserPasswordForm.module.css";

const EditUserPasswordForm = ({ onBack }) => {
  const { editUserPasswordForm } = useAuthStore();

  const inputChangeHandler = () => {};

  const submitHandler = async () => {
    await editUserPasswordForm();
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
      <input type="password" id="password" name="password" />
      <label htmlFor="new-password">새 비밀번호</label>
      <input type="password" id="new-password" name="newPassword" />
      <label htmlFor="confirm-new-password">새 비밀번호 확인</label>
      <input
        type="password"
        id="confirm-new-password"
        name="confirmNewPassword"
      />
    </form>
    // </Modal>
  );
};

export default EditUserPasswordForm;
