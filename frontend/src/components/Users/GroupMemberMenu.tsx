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
  onGrantAdmin,
  onRevokeAdmin,
  onKickMember,
  origin,
  style,
}: GroupMemberMenuProps) => {
  const { userInfo } = useAuthStore();

  return (
    <>
      <div
        key={`${userId}-${origin}`}
        className={classes["group-member-menu-wrapper"]}
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

            {userInfo?._id === userId ? (
              <>
                {currentRole === "host" && (
                  <div className={classes["group-member-menu-role"]}>
                    이 그룹의 호스트입니다.
                  </div>
                )}
                {currentRole === "admin" && (
                  <div className={classes["group-member-menu-role"]}>
                    이 그룹의 관리자입니다.
                  </div>
                )}
                {currentRole === "member" && (
                  <div className={classes["group-member-menu-role"]}>
                    이 그룹의 멤버입니다.
                  </div>
                )}
              </>
            ) : (
              <>
                {targetRole === "host" && (
                  <div className={classes["group-member-menu-role"]}>
                    이 그룹의 호스트입니다.
                  </div>
                )}
                {targetRole === "admin" && (
                  <div className={classes["group-member-menu-role"]}>
                    이 그룹의 관리자입니다.
                  </div>
                )}
                {targetRole === "member" && (
                  <div className={classes["group-member-menu-role"]}>
                    이 그룹의 멤버입니다.
                  </div>
                )}
              </>
            )}
          </div>

          {userInfo?._id !== userId && (
            <>
              {currentRole === "host" && (
                <div className={classes["group-member-menu-actions"]}>
                  <button
                    className={classes["group-member-menu-action-button"]}
                    onClick={() => onTransferHost(userId)}
                  >
                    호스트 권한 위임
                  </button>

                  {targetRole === "admin" && (
                    <button
                      className={classes["group-member-menu-action-button"]}
                      onClick={() => onRevokeAdmin(userId)}
                    >
                      관리자 권한 회수
                    </button>
                  )}

                  {targetRole === "member" && (
                    <button
                      className={classes["group-member-menu-action-button"]}
                      onClick={() => onGrantAdmin(userId)}
                    >
                      관리자 권한 부여
                    </button>
                  )}

                  {(targetRole === "admin" || targetRole === "member") && (
                    <button
                      className={classes["group-member-menu-action-button"]}
                      onClick={() => onKickMember(userId)}
                    >
                      강제 퇴장
                    </button>
                  )}
                </div>
              )}

              {currentRole === "admin" && (
                <div className={classes["group-member-menu-actions"]}>
                  {targetRole === "member" && (
                    <button
                      className={classes["group-member-menu-action-button"]}
                      onClick={() => onKickMember(userId)}
                    >
                      강제 퇴장
                    </button>
                  )}
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
