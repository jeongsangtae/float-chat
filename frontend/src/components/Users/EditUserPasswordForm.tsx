import { useState } from "react";
import { toast } from "react-toastify";

import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import useAuthStore from "../../store/authStore";

import { OnBackProps, EditUserPasswordData } from "../../types";

import classes from "./EditUserPasswordForm.module.css";

const EditUserPasswordForm = ({ onBack }: OnBackProps) => {
  const { editUserPasswordForm } = useAuthStore();

  const initialPasswordEditData = {
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const [passwordEditData, setPasswordEditData] =
    useState<EditUserPasswordData>(initialPasswordEditData);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  // 비밀번호 입력값 변경 처리
  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = event.target;
    setPasswordEditData({ ...passwordEditData, [name]: value });
  };

  // 비밀번호 변경 요청
  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const passwordEditResult = await editUserPasswordForm(passwordEditData);

    const isNetworkError =
      !passwordEditResult.success &&
      passwordEditResult.type === "NETWORK_ERROR";

    if (isNetworkError) {
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
      <div className={classes["password-edit-title-wrapper"]}>
        <button
          className={classes["password-edit-back"]}
          type="button"
          onClick={onBack}
        >
          <ArrowLeft />
        </button>
        <h2 className={classes["password-edit-title"]}>비밀번호 변경</h2>
      </div>
      <p className={classes["password-edit-description"]}>
        현재 비밀번호와 새 비밀번호를 입력하세요.
      </p>

      <label className={classes["password-edit-label"]} htmlFor="password">
        현재 비밀번호
      </label>
      <div className={classes["password-edit-input-wrapper"]}>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={passwordEditData.password}
          onChange={inputChangeHandler}
          className={classes["password-edit-input"]}
        />
        <button
          type="button"
          className={classes["password-edit-eye-icon"]}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <label className={classes["password-edit-label"]} htmlFor="new-password">
        새 비밀번호
      </label>
      <div className={classes["password-edit-input-wrapper"]}>
        <input
          type={showNewPassword ? "text" : "password"}
          id="new-password"
          name="newPassword"
          value={passwordEditData.newPassword}
          onChange={inputChangeHandler}
          className={classes["password-edit-input"]}
        />
        <button
          type="button"
          className={classes["password-edit-eye-icon"]}
          onClick={() => setShowNewPassword((prev) => !prev)}
        >
          {showNewPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <label
        className={classes["password-edit-label"]}
        htmlFor="confirm-new-password"
      >
        새 비밀번호 확인
      </label>
      <div className={classes["password-edit-input-wrapper"]}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="confirm-new-password"
          name="confirmNewPassword"
          value={passwordEditData.confirmNewPassword}
          onChange={inputChangeHandler}
          className={classes["password-edit-input"]}
        />
        <button
          type="button"
          className={classes["password-edit-eye-icon"]}
          onClick={() => setShowConfirmPassword((prev) => !prev)}
        >
          {showConfirmPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <p className={classes["error-message"]}>{errorMessage}</p>
      <div className={classes["password-edit-submit"]}>
        <button type="submit">변경</button>
      </div>
    </form>
  );
};

export default EditUserPasswordForm;
