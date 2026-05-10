import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

import useAuthStore from "../../store/authStore";
import useSocketStore from "../../store/socketStore";

import { OnBackProps, DeleteUserData } from "../../types";

import classes from "./DeleteUserForm.module.css";

const DeleteUserForm = ({ onBack }: OnBackProps) => {
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

    navigate("/login", { state: { userDeleteSuccess: true } });
  };

  return (
    <form className={classes["user-delete-wrapper"]} onSubmit={submitHandler}>
      <button type="button" onClick={onBack}>
        뒤로 가기
      </button>
      <h2>계정 탈퇴</h2>
      <p>⚠ 계정 탈퇴 시 복구 불가능합니다.</p>

      <label htmlFor="password">비밀번호 입력</label>
      <input
        type="password"
        id="password"
        name="password"
        value={userDeleteData.password}
        onChange={inputChangeHandler}
      />
      <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
        {showPassword ? <EyeOff /> : <Eye />}
      </button>

      <label htmlFor="confirmText">"탈퇴하겠습니다"를 입력하세요</label>
      <input
        type="text"
        id="confirm-text"
        name="confirmText"
        value={userDeleteData.confirmText}
        onChange={inputChangeHandler}
      />

      <p className={classes["error-message"]}>{errorMessage}</p>
      <button type="submit">탈퇴</button>
    </form>
  );
};

export default DeleteUserForm;
