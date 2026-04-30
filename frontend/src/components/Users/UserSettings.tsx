// import useAuthStore from "../../store/authStore";
import { useState } from "react";

import Modal from "../UI/Modal";
import { ModalProps } from "../../types";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";

import classes from "./UserSettings.module.css";
import EditUserProfileForm from "./EditUserProfileForm";
import Avatar from "./Avatar";

const UserSettings = ({ onToggle }: ModalProps) => {
  const { userInfo } = useAuthStore();
  const { modalData } = useModalStore();

  const [activeView, setActiveView] = useState<"profile" | "auth">("profile");

  console.log(userInfo);

  return (
    <Modal onToggle={onToggle}>
      <div className={classes["user-setting-wrapper"]}>
        {/* 버튼 영역 */}
        <div className={classes["user-setting-sidebar-wrapper"]}>
          <div
            className={classes["user-info"]}
            onClick={() => setActiveView("profile")}
          >
            <Avatar
              nickname={userInfo?.nickname ?? ""}
              avatarImageUrl={userInfo?.avatarImageUrl ?? null}
              avatarColor={userInfo?.avatarColor ?? null}
            />
            <div className={classes["user-info-edit"]}>
              <div className={classes["user-nickname"]}>
                {userInfo?.nickname}
              </div>
              <div>프로필 편집</div>
            </div>
          </div>
          <div onClick={() => setActiveView("auth")}>계정 설정</div>
        </div>
        <div className={classes["user-setting-content-wrapper"]}>
          {/* 프로필 수정 관련 영역 */}
          {/* 닉네임, 아바타 색, 아바타 이미지 수정 */}
          {activeView === "profile" && <EditUserProfileForm />}

          {/* 계정 설정 관련 영역 */}
          {/* 비밀번호 변경, 로그아웃, 계정 삭제 */}
          {activeView === "auth" && (
            <div>
              <div>닉네임</div>
              <div>{userInfo?.nickname}</div>
              <div>사용자명</div>
              <div>{userInfo?.username}</div>
              <div>이메일</div>
              <div>{userInfo?.email}</div>
              <div>비밀번호 변경</div>
              <div className={classes["password-edit-wrapper"]}>
                <label htmlFor="password">현재 비밀번호</label>
                <input type="password" id="password" name="password" />
                <label htmlFor="new-password">새 비밀번호</label>
                <input type="password" id="new-password" name="newPassword" />
                <label htmlFor="confirm-new-password">새 비밀번호 확인</label>
                <input
                  type="password"
                  id="confirm-new-password"
                  name="confirmNewPassword"
                />
              </div>
              <div>계정 탈퇴</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserSettings;
