import React, { useState } from "react";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

import { Palette, Image } from "lucide-react";
import { IoClose } from "react-icons/io5";

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
  const [avatarMode, setAvatarMode] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>(
    modalData.avatarColor ?? "#ccc"
  );
  const [avatarImageUrl, setAvatarImageUrl] = useState<string>(
    modalData.avatarImageUrl ?? ""
  );

  const [imageError, setImageError] = useState(false);
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

  const avatarModeChangeHandler = () => {
    setAvatarMode(!avatarMode);
  };

  const avatarImageUrlChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAvatarImageUrl(event.target.value);
    setImageError(false);
  };

  const avatarImageUrlResetHandler = () => {
    setAvatarImageUrl("");
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (trimmedNickname.length < 2) {
      setErrorMessage("2자에서 15자 사이로 입력해주세요.");
      return;
    }

    console.log(modalData);

    try {
      if (avatarMode) {
        // 객체 기반 방식
        await editUserProfileForm({
          trimmedNickname,
          avatarImageUrl,
          avatarMode,
          modalData,
        });

        // 위치 기반 방식
        // await editUserProfileForm(
        //   trimmedNickname,
        //   "",
        //   avatarImageUrl,
        //   modalData
        // );
      } else {
        // 객체 기반 방식
        await editUserProfileForm({
          trimmedNickname,
          avatarColor,
          avatarMode,
          // avatarImageUrl: modalData.avatarImageUrl,
          modalData,
        });

        // 위치 기반 방식
        // await editUserProfileForm(trimmedNickname, avatarColor, "", modalData);
      }

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
          <div className={classes["avatar-header"]}>
            <div className={classes["avatar-edit-title"]}>
              {avatarMode ? "아바타 이미지" : "아바타 색"}
            </div>
            <button
              className={classes["avatar-mode-button"]}
              type="button"
              onClick={avatarModeChangeHandler}
            >
              {avatarMode ? (
                <>
                  <span className={classes.icon}>
                    <Palette />
                  </span>
                  아바타 색
                </>
              ) : (
                <>
                  <span className={classes.icon}>
                    <Image />
                  </span>
                  아바타 이미지
                </>
              )}
            </button>
          </div>
          {avatarMode ? (
            <div className={classes["avatar-img-preview-wrapper"]}>
              <div className={classes["avatar-img-preview"]}>
                {avatarImageUrl && !imageError ? (
                  <img
                    onError={() => setImageError(true)}
                    src={avatarImageUrl}
                  />
                ) : (
                  <div
                    className={classes["avatar-color-preview"]}
                    style={{ backgroundColor: userInfo?.avatarColor || "#ccc" }}
                  >
                    {userInfo?.nickname.charAt(0)}
                  </div>
                )}
              </div>
              <div className={classes["avatar-img-url-input-wrapper"]}>
                <input
                  className={classes["avatar-img-url-input"]}
                  required
                  type="url"
                  value={avatarImageUrl}
                  onChange={avatarImageUrlChangeHandler}
                  placeholder="이미지 URL을 입력하세요"
                />
                {avatarImageUrl.length > 0 && (
                  <IoClose
                    className={classes["avatar-img-reset-button"]}
                    type="button"
                    onClick={avatarImageUrlResetHandler}
                  />
                )}
              </div>
            </div>
          ) : (
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
          )}
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
