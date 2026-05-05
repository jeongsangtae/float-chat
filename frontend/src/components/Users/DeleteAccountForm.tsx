import { OnBackProps } from "../../types";

import classes from "./DeleteAccountForm.module.css";

const DeleteAccountForm = ({ onBack }: OnBackProps) => {
  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
  };

  return (
    <form
      className={classes["account-delete-wrapper"]}
      onSubmit={submitHandler}
    >
      <button type="button" onClick={onBack}>
        뒤로 가기
      </button>
      <h2>계정 탈퇴</h2>
      <p>⚠ 계정 탈퇴 시 복구 불가능합니다.</p>

      <label htmlFor="password">비밀번호 입력</label>
      <input type="password" id="password" name="password" />

      <label htmlFor="confirmText">"탈퇴하겠습니다"를 입력하세요</label>
      <input type="text" id="confirm-text" name="confirmText" />

      <button type="submit">탈퇴</button>
    </form>
  );
};

export default DeleteAccountForm;
