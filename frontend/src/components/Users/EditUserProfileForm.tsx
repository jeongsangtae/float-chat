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

  const [nickname, setNickname] = useState<string>("");
  const [avatarColor, setAvatarColor] = useState<string>(
    userInfo?.avatarColor || "#ccc"
  );

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNickname(event.target.value);
  };

  // const avatarColorSelected = (
  //   event: React.MouseEvent<HTMLButtonElement>
  // ): void => {
  //   setAvatarColor(event.target.value);
  // };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const trimmedNickname = nickname.trim();

    if (!userInfo) {
      alert("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
      return;
    }

    if (!trimmedNickname) {
      alert("닉네임은 공백만으로 구성될 수 없습니다.");
      return;
    }

    try {
      await editUserProfileForm(nickname, avatarColor, userInfo, modalData);

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
        <h2>프로필 수정</h2>
        <div>
          <div>닉네임</div>
          <input
            required
            type="text"
            id="nickname"
            name="nickname"
            defaultValue={modalData.nickname}
            maxLength={15}
            placeholder="내용 입력"
            onChange={inputChangeHandler}
          />
        </div>
        <div>
          <div>아바타 색상</div>
          <div>
            {avatarColors.map((color) => (
              <button
                className={classes["avatar-color-button"]}
                type="button"
                key={color}
                style={{
                  backgroundColor: color,
                  border: avatarColor === color ? "2px solid white" : "none",
                  // border:
                  //   avatarColor === color &&
                  //   avatarColor !== userInfo?.avatarColor
                  //     ? "2px solid white"
                  //     : userInfo?.avatarColor === color
                  //     ? "2px solid black"
                  //     : "none",
                  // border:
                  //   avatarColor === color
                  //     ? "2px solid white"
                  //     : userInfo?.avatarColor === color
                  //     ? "2px solid black"
                  //     : "none",
                  width:
                    avatarColor === color || userInfo?.avatarColor === color
                      ? "2.2rem"
                      : "2rem",
                  height:
                    avatarColor === color || userInfo?.avatarColor === color
                      ? "2.2rem"
                      : "2rem",
                }}
                onClick={() => setAvatarColor(color)}
              >
                {userInfo?.nickname.charAt(0)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <button type="submit">수정</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserProfileForm;
