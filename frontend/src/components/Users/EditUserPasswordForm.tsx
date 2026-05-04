import { useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";

import classes from "./EditUserPasswordForm.module.css";

interface PasswordEditDataType {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface OnBackType {
  onBack: () => void;
}

const EditUserPasswordForm = ({ onBack }: OnBackType) => {
  const { editUserPasswordForm } = useAuthStore();

  const initialPasswordEditData = {
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const [passwordEditData, setPasswordEditData] =
    useState<PasswordEditDataType>(initialPasswordEditData);

  const [errorMessage, setErrorMessage] = useState<string>("");

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

    const passwordEditResult = await editUserPasswordForm(passwordEditData);

    if (
      !passwordEditResult.success &&
      passwordEditResult.type === "NETWORK_ERROR"
    ) {
      toast.error("네트워크 문제 발생");
      return;
    }

    if (!passwordEditResult.success) {
      setErrorMessage(passwordEditResult.message || "에러 발생");
      return;
    }

    setErrorMessage("");
    setPasswordEditData(initialPasswordEditData);
    toast.success("비밀번호 수정 성공");
  };

  return (
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

      <p className={classes["error-message"]}>{errorMessage}</p>
      <button type="submit">변경</button>
    </form>
  );
};

export default EditUserPasswordForm;
