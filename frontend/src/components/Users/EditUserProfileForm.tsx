import React, { useState } from "react";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

import classes from "./EditUserProfileForm.module.css";

const EditUserProfileForm = ({ onToggle }: ModalProps) => {
  const avatarColors = [
    "#D32F2F",
    "#C2185B",
    "#7B1FA2",
    "#512DA8",
    "#303F9F",
    "#1976D2",
    "#0288D1",
    "#0097A7",
    "#00796B",
    "#388E3C",
    "#689F38",
    "#FFA000",
    "#F57C00",
    "#E64A19",
    "#5D4037",
    "#455A64",
    "#607D8B",
    "#009688",
    "#AB47BC",
    "#1E88E5",
  ];

  const { userInfo, editUserProfileForm } = useAuthStore();
  const { modalData } = useModalStore();

  const [nickname, setNickname] = useState<string>(modalData.nickname ?? "");
  const [avatarColor, setAvatarColor] = useState<string>(
    modalData.avatarColor ?? "#ccc"
  );

  const [errorMessage, setErrorMessage] = useState<string>("");

  const trimmedNickname = nickname.trim();
  const nicknameValid = trimmedNickname.length >= 2;

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = event.target.value;
    setNickname(value);

    if (value.trim().length < 2) {
      setErrorMessage("2자에서 15자 사이로 입력해주세요.");
    } else {
      setErrorMessage("");
    }
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (trimmedNickname.length < 2) {
      setErrorMessage("2자에서 15자 사이로 입력해주세요.");
      return;
    }

    try {
      await editUserProfileForm(trimmedNickname, avatarColor, modalData);

      console.log("사용자 정보 수정 성공");
      onToggle();
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "사용자 정보를 수정하는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <Modal onToggle={onToggle}>
      <form onSubmit={submitHandler}>
        <h2 className={classes.title}>프로필</h2>
        <div className={classes["nickname-edit-wrapper"]}>
          <div className={classes["nickname-edit-title"]}>닉네임</div>
          <input
            required
            type="text"
            autoComplete="off"
            id="nickname"
            name="nickname"
            value={nickname}
            maxLength={15}
            placeholder="내용 입력"
            onChange={inputChangeHandler}
            className={`${classes["nickname-edit-input"]} ${
              errorMessage ? classes.error : ""
            }`}
          />
        </div>
        {/* {errorMessage && <div className={classes["error-message"]}>{errorMessage}</div>} */}

        <div className={classes["error-message"]}>{errorMessage}</div>

        <div className={classes.underline}></div>

        <div>
          <div className={classes["avatar-color-edit-title"]}>아바타 색</div>
          <div className={classes["avatar-color-list"]}>
            {avatarColors.map((color) => (
              <button
                className={`${classes["avatar-color-button"]} ${
                  avatarColor === color ? classes.selected : ""
                }`}
                type="button"
                key={color}
                style={{ backgroundColor: color }}
                onClick={() => setAvatarColor(color)}
              >
                {userInfo?.nickname.charAt(0)}
              </button>
            ))}
          </div>
        </div>
        <div className={classes["submit-button"]}>
          <button
            type="submit"
            className={nicknameValid ? classes.active : classes.disable}
          >
            수정
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserProfileForm;
