// import useAuthStore from "../../store/authStore";
import { useState } from "react";

import Modal from "../UI/Modal";

import { ModalProps } from "../../types";

import useModalStore from "../../store/modalStore";

import classes from "./UserSettings.module.css";

const UserSettings = ({ onToggle }: ModalProps) => {
  // const { userInfo } = useAuthStore();
  const { modalData } = useModalStore();

  const [activeView, setActiveView] = useState<"profile" | "auth">(
    modalData.initialView ?? "profile"
  );

  return (
    <Modal onToggle={onToggle}>
      <div className={classes["user-setting-wrapper"]}>
        {/* 버튼 영역 */}
        <div className={classes["user-setting-sidebar"]}>
          <div className={classes["user-info"]}>
            <div className={classes["user-avatar"]}></div>
            <span className={classes["user-nickname"]}>
              {modalData.nickname}
            </span>
          </div>
          <div onClick={() => setActiveView("profile")}>프로필 수정</div>
          <div onClick={() => setActiveView("auth")}>계정 설정</div>
        </div>
        {/* 프로필 수정 관련 영역 */}
        {/* 닉네임, 아바타 색, 아바타 이미지 수정 */}
        {activeView === "profile" && <div></div>}

        {/* 계정 설정 관련 영역 */}
        {/* 비밀번호 변경, 로그아웃, 계정 삭제 */}
        {activeView === "auth" && <div></div>}
      </div>
    </Modal>
  );
};

export default UserSettings;
