// import useAuthStore from "../../store/authStore";
import { useState } from "react";

import Modal from "../UI/Modal";
import { ModalProps } from "../../types";

import useAuthStore from "../../store/authStore";
// import useModalStore from "../../store/modalStore";

import classes from "./UserSettings.module.css";
import EditUserProfileForm from "./EditUserProfileForm";
import EditUserPasswordForm from "./EditUserPasswordForm";
import Avatar from "./Avatar";

const UserSettings = ({ onToggle }: ModalProps) => {
  const { userInfo } = useAuthStore();
  // const { modalData, activeModal, toggleModal } = useModalStore();

  const [activeView, setActiveView] = useState<"profile" | "auth" | "password">(
    "profile"
  );

  // const editUserProfileFormHandler = () => {
  //   toggleModal("editUserPasswordForm", "PATCH", {});
  // };

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
              {/* <div onClick={editUserProfileFormHandler}>비밀번호 변경</div> */}
              <div onClick={() => setActiveView("password")}>비밀번호 변경</div>
              <div>계정 탈퇴</div>
            </div>
          )}
          {activeView === "password" && (
            <EditUserPasswordForm onBack={() => setActiveView("auth")} />
          )}
          {/* {activeModal === "editUserPasswordForm" && (
            <EditUserPasswordForm
              onToggle={() => toggleModal("editUserPasswordForm")}
            />
          )} */}
        </div>
      </div>
    </Modal>
  );
};

export default UserSettings;
