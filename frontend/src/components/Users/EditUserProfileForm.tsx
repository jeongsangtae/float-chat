import React, { useState } from "react";
import { toast } from "react-toastify";

import { Palette, Image } from "lucide-react";
import { IoClose } from "react-icons/io5";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";

import classes from "./EditUserProfileForm.module.css";

const EditUserProfileForm = () => {
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

  const [nickname, setNickname] = useState<string>(userInfo?.nickname ?? "");
  const [avatarMode, setAvatarMode] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>(
    userInfo?.avatarColor ?? "#ccc"
  );
  const [avatarImageUrl, setAvatarImageUrl] = useState<string>(
    userInfo?.avatarImageUrl ?? ""
  );

  const [imageError, setImageError] = useState(false);

  const trimmedNickname = nickname.trim();
  const nicknameValid = trimmedNickname.length >= 2;

  const errorMessage =
    trimmedNickname.length > 0 && trimmedNickname.length < 2
      ? "2자에서 15자 사이로 입력해주세요."
      : "";

  const hasAvatarImage = avatarImageUrl && !imageError;

  // 닉네임 입력 처리
  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = event.target.value;

    setNickname(value);
  };

  // 아바타 색 / 이미지 모드 전환
  const avatarModeChangeHandler = () => {
    setAvatarMode(!avatarMode);
  };

  // 아바타 이미지 URL 입력 처리
  const avatarImageUrlChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAvatarImageUrl(event.target.value);
    setImageError(false);
  };

  // 아바타 이미지 URL 초기화
  const avatarImageUrlResetHandler = () => {
    setAvatarImageUrl("");
  };

  // 프로필 수정 요청
  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!nicknameValid) return;

    if (avatarMode) {
      // 현재 사용 중인 객체 기반 호출 방식
      await editUserProfileForm({
        trimmedNickname,
        avatarImageUrl,
        avatarMode,
        modalContext: {
          _id: modalData._id,
          method: modalData.method,
          avatarImageUrl,
        },
      });

      // 이전 위치 기반 호출 방식 (참고용)
      // await editUserProfileForm(
      //   trimmedNickname,
      //   "",
      //   avatarImageUrl,
      //   modalData
      // );
    } else {
      // 현재 사용 중인 객체 기반 호출 방식
      await editUserProfileForm({
        trimmedNickname,
        avatarColor,
        avatarMode,
        modalContext: {
          _id: modalData._id,
          method: modalData.method,
          avatarImageUrl,
        },
      });

      // 이전 위치 기반 호출 방식 (참고용)
      // await editUserProfileForm(trimmedNickname, avatarColor, "", modalData);
    }

    toast.success("프로필 수정 성공");
  };

  return (
    <form
      className={classes["user-profile-edit-wrapper"]}
      onSubmit={submitHandler}
    >
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
          maxLength={10}
          placeholder="내용 입력"
          onChange={inputChangeHandler}
          className={`${classes["nickname-edit-input"]} ${
            errorMessage ? classes.error : ""
          }`}
        />
      </div>

      <div className={classes["error-message"]}>{errorMessage}</div>

      <div className={classes.underline}></div>

      {/* 아바타 설정 */}
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
              {hasAvatarImage ? (
                <img onError={() => setImageError(true)} src={avatarImageUrl} />
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
  );
};

export default EditUserProfileForm;
