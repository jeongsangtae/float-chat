import { useState } from "react";

import { BiSolidPencil } from "react-icons/bi";
import { FaUser } from "react-icons/fa";

import Modal from "../UI/Modal";
import { ModalProps } from "../../types";

import useAuthStore from "../../store/authStore";

import EditUserProfileForm from "./EditUserProfileForm";
import EditUserPasswordForm from "./EditUserPasswordForm";
import Avatar from "./Avatar";
import DeleteUserForm from "./DeleteUserForm";

import classes from "./UserSettings.module.css";

const UserSettings = ({ onToggle }: ModalProps) => {
  const { userInfo } = useAuthStore();

  const [activeView, setActiveView] = useState<
    "profile" | "auth" | "password" | "deleteUser"
  >("profile");

  return (
    <Modal onToggle={onToggle}>
      <div className={classes["user-setting-wrapper"]}>
        {/* 버튼 영역 */}
        <div className={classes["user-setting-sidebar-wrapper"]}>
          <div
            className={classes["user-info"]}
            onClick={() => setActiveView("profile")}
          >
            <div className={classes["user-info-avatar"]}>
              <Avatar
                nickname={userInfo?.nickname ?? ""}
                avatarImageUrl={userInfo?.avatarImageUrl ?? null}
                avatarColor={userInfo?.avatarColor ?? null}
                extraClass="user-info-avatar"
              />
            </div>
            <div className={classes["user-info-edit"]}>
              <div className={classes["user-nickname"]}>
                {userInfo?.nickname}
              </div>
              <div className={classes["user-profile-edit"]}>
                프로필 편집
                <BiSolidPencil className={classes["user-profile-edit-icon"]} />
              </div>
            </div>
          </div>
          <div className={classes.underline}></div>
          <div
            className={classes["auth-menu"]}
            onClick={() => setActiveView("auth")}
          >
            <FaUser className={classes["auth-menu-icon"]} />
            <div className={classes["auth-menu-title"]}>계정</div>
          </div>
        </div>

        <div className={classes["user-setting-content-wrapper"]}>
          {/* 프로필 수정 관련 영역 */}
          {/* 닉네임, 아바타 색, 아바타 이미지 수정 */}
          {activeView === "profile" && <EditUserProfileForm />}

          {/* 계정 설정 관련 영역 */}
          {/* 비밀번호 변경, 로그아웃, 계정 삭제 */}
          {activeView === "auth" && (
            <div className={classes["auth-wrapper"]}>
              <h2 className={classes["auth-title"]}>계정</h2>

              <div className={classes["auth-info-list"]}>
                <div className={classes["section-title"]}>계정 정보</div>
                <div className={classes["auth-info-item"]}>
                  <div>닉네임</div>
                  <div>{userInfo?.nickname}</div>
                </div>

                <div className={classes["auth-info-item"]}>
                  <div>사용자명</div>
                  <div>{userInfo?.username}</div>
                </div>

                <div className={classes["auth-info-item"]}>
                  <div>이메일</div>
                  <div>{userInfo?.email}</div>
                </div>
              </div>

              <div className={classes["auth-action-list"]}>
                <div className={classes["section-title"]}>보안</div>
                <div className={classes["auth-action-item"]}>
                  <div>비밀번호</div>
                  <button
                    className={classes["auth-action-button"]}
                    onClick={() => setActiveView("password")}
                  >
                    수정
                  </button>
                </div>

                <div
                  className={`${classes["section-title"]} ${classes["danger-section"]}`}
                >
                  위험
                </div>
                <div
                  className={`${classes["auth-action-item"]} ${classes["danger-item"]}`}
                >
                  <div className={classes["auth-action-content"]}>
                    <div className={classes["auth-action-title"]}>
                      계정 삭제
                    </div>
                    <div className={classes["auth-action-description"]}>
                      계정을 영구적으로 삭제
                    </div>
                  </div>
                  <button
                    className={`${classes["auth-action-button"]} ${classes["delete-button"]}`}
                    onClick={() => setActiveView("deleteUser")}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === "password" && (
            <EditUserPasswordForm onBack={() => setActiveView("auth")} />
          )}
          {activeView === "deleteUser" && (
            <DeleteUserForm
              onBack={() => setActiveView("auth")}
              onToggle={onToggle}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserSettings;
