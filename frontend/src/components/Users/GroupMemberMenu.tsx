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
  currentRole,
  targetRole,
  onTransferHost,
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

                {currentRole === "host" && <div>이 그룹의 호스트입니다.</div>}

                {currentRole === "admin" && <div>이 그룹의 관리자입니다.</div>}

                {currentRole === "member" && <div>이 그룹의 멤버입니다.</div>}

                {/* <div className={classes["group-member-menu-action-wrapper"]}>
                  <button
                    className={classes["group-member-menu-action-button"]}
                  >
                    프로필 편집
                  </button>
                </div> */}
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
              {currentRole === "host" && (
                <div>
                  <button onClick={() => onTransferHost(userId)}>
                    호스트 권한 위임
                  </button>

                  {targetRole === "admin" && <button>관리자 권한 회수</button>}

                  {targetRole === "member" && <button>관리자 권한 부여</button>}

                  {(targetRole === "admin" || targetRole === "member") && (
                    <button>강제 퇴장</button>
                  )}
                </div>
              )}

              {currentRole === "admin" && (
                <div>
                  {targetRole === "host" && <div>이 그룹의 호스트입니다.</div>}

                  {targetRole === "member" && <button>강제 퇴장</button>}
                </div>
              )}

              {currentRole === "member" && (
                <div>
                  {targetRole === "host" && <div>이 그룹의 호스트입니다.</div>}

                  {targetRole === "admin" && <div>이 그룹의 관리자입니다.</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupMemberMenu;
