import useAuthStore from "../../store/authStore";

import Avatar from "./Avatar";

import { GroupMemberMenuProps } from "../../types";

import classes from "./GroupMemberMenu.module.css";

const GroupMemberMenu = ({
  userId,
  nickname,
  avatarImageUrl,
  avatarColor,
  onlineChecked,
  origin,
  style,
}: GroupMemberMenuProps) => {
  const { userInfo } = useAuthStore();

  return (
    <>
      <div
        key={`${userId}-${origin}`} // 삭제해도 되는지 확인 필요
        className={`${
          classes["group-member-menu-wrapper"]
        } group-member-menu-container ${
          userInfo?._id === userId ? classes["group-member-menu-self"] : ""
        }`}
        style={style}
      >
        {avatarImageUrl ? (
          <img
            className={classes["group-member-menu-header-img"]}
            src={avatarImageUrl}
          />
        ) : (
          <div
            className={classes["group-member-menu-header-color"]}
            style={{ backgroundColor: avatarColor || "#ccc" }}
          ></div>
        )}

        <div className={classes["group-member-menu-info"]}>
          {userInfo?._id === userId ? (
            <>
              <div className={classes["group-member-menu-avatar-wrapper"]}>
                <Avatar
                  nickname={nickname}
                  avatarColor={avatarColor}
                  avatarImageUrl={avatarImageUrl}
                  onlineChecked={onlineChecked}
                  showOnlineDot={true}
                  extraClass="group-member-menu-avatar"
                  dotClass="group-member-menu-online-dot"
                />
              </div>
              <div className={classes["group-member-menu-content"]}>
                <div
                  className={classes["group-member-menu-nickname"]}
                  title={nickname}
                >
                  {nickname}
                </div>
                <div className={classes["group-member-menu-action-wrapper"]}>
                  <button
                    className={classes["group-member-menu-action-button"]}
                    // onClick={userProfileEditHandler}
                  >
                    프로필 편집
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={classes["group-member-menu-avatar-wrapper"]}>
                <Avatar
                  nickname={nickname}
                  avatarColor={avatarColor}
                  avatarImageUrl={avatarImageUrl}
                  onlineChecked={onlineChecked}
                  showOnlineDot={true}
                  extraClass="group-member-menu-avatar"
                  dotClass="group-member-menu-online-dot"
                />
              </div>
              <div>
                <div>호스트 권한 위임</div>
                <div>관리자 권한 부여</div>
                <div>강제 퇴장</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupMemberMenu;
