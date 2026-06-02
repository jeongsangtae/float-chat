import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import useAuthStore from "../../store/authStore";
import useSocketStore from "../../store/socketStore";

import { OnBackProps, DeleteUserData } from "../../types";

import classes from "./DeleteUserForm.module.css";

interface DeleteUserFormProps extends OnBackProps {
  onToggle: () => void;
}

const DeleteUserForm = ({ onBack, onToggle }: DeleteUserFormProps) => {
  const navigate = useNavigate();
  const { deleteUserForm } = useAuthStore();
  const { disconnect } = useSocketStore();
  const initialUserDeleteData = {
    password: "",
    confirmText: "",
  };

  const [userDeleteData, setUserDeleteData] = useState<DeleteUserData>(
    initialUserDeleteData
  );

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserDeleteData({ ...userDeleteData, [name]: value });
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const userDeleteResult = await deleteUserForm(userDeleteData);

    if (
      !userDeleteResult.success &&
      userDeleteResult.type === "NETWORK_ERROR"
    ) {
      toast.error("네트워크 문제 발생");
      return;
    }

    if (!userDeleteResult.success) {
      setErrorMessage(userDeleteResult.message || "에러 발생");
      return;
    }

    disconnect();

    setErrorMessage("");
    setUserDeleteData(initialUserDeleteData);

    onToggle();

    navigate("/login", { state: { userDeleteSuccess: true } });
  };

  return (
    <form className={classes["user-delete-wrapper"]} onSubmit={submitHandler}>
      <div className={classes["user-delete-title-wrapper"]}>
        <button
          className={classes["user-delete-back"]}
          type="button"
          onClick={onBack}
        >
          <ArrowLeft />
        </button>
        <h2 className={classes["user-delete-title"]}>계정 탈퇴</h2>
      </div>
      <p className={classes["user-delete-description"]}>
        ⚠ 계정 탈퇴 시 복구 불가능합니다.
      </p>

      <label className={classes["user-delete-label"]} htmlFor="password">
        비밀번호 입력
      </label>
      <div className={classes["user-delete-input-wrapper"]}>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={userDeleteData.password}
          onChange={inputChangeHandler}
          className={classes["user-delete-input"]}
        />
        <button
          type="button"
          className={classes["user-delete-eye-icon"]}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <label className={classes["user-delete-label"]} htmlFor="confirmText">
        "탈퇴하겠습니다"를 입력하세요
      </label>
      <div className={classes["user-delete-input-wrapper"]}>
        <input
          type="text"
          id="confirm-text"
          name="confirmText"
          value={userDeleteData.confirmText}
          onChange={inputChangeHandler}
          className={classes["user-delete-input"]}
        />
      </div>

      <p className={classes["error-message"]}>{errorMessage}</p>
      <div className={classes["user-delete-submit"]}>
        <button type="submit">탈퇴</button>
      </div>
    </form>
  );
};

export default DeleteUserForm;
