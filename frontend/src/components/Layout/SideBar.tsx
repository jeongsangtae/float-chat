import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BsFillChatSquareFill } from "react-icons/bs";
import { LuLogOut } from "react-icons/lu";
import { IoMdAddCircle, IoMdSettings } from "react-icons/io";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";
import useSocketStore from "../../store/socketStore";
import useFriendStore from "../../store/friendStore";

import GroupChats from "../GroupChats/GroupChats";
import GroupChatForm from "../GroupChats/GroupChatForm";
import EditUserProfileForm from "../Users/EditUserProfileForm";

import classes from "./SideBar.module.css";

interface SideBarProps {
  onLeaveGroupChat: () => void;
}

const SideBar = ({ onLeaveGroupChat }: SideBarProps) => {
  const { isLoggedIn, userInfo, renewToken, refreshTokenExp, logout } =
    useAuthStore();
  const { activeModal, toggleModal } = useModalStore();
  const { disconnect } = useSocketStore();
  const { friendRequests } = useFriendStore();

  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname === "/me"; // 홈 버튼 기준 경로

  // 앱이 처음 로드될 때 로그인 상태 확인
  useEffect(() => {
    const renewTokens = async () => {
      if (isLoggedIn) {
        await refreshTokenExp();
        await renewToken();
      }
    };

    renewTokens();
  }, [isLoggedIn]);

  const userProfileEditHandler = (): void => {
    toggleModal("editUserProfileForm", "PATCH", {
      _id: userInfo?._id,
      nickname: userInfo?.nickname,
      avatarColor: userInfo?.avatarColor,
    });
  };

  const logoutHandler = async (): Promise<void> => {
    await logout();
    disconnect();
    navigate("/login");
    // navigate("/me");
  };

  const receiverRequests = friendRequests.filter(
    (friendRequest) => friendRequest.receiver === userInfo?._id
  );

  return (
    <div className={classes.sidebar}>
      <div className={classes["sidebar-top"]}>
        {isLoggedIn && (
          <>
            <button
              className={`${classes["home-button"]} ${
                active ? classes.active : ""
              }`}
              onClick={onLeaveGroupChat}
            >
              <span className={classes.indicator} />
              <BsFillChatSquareFill className={classes["chat-icon"]} />
              <div className={`${classes.eye} ${classes["left-eye"]}`}></div>
              <div className={`${classes.eye} ${classes["right-eye"]}`}></div>

              {receiverRequests.length > 0 && (
                <div className={classes["friend-request-badge"]}>
                  <span className={classes["friend-request-count"]}>
                    {receiverRequests.length > 99
                      ? "99"
                      : receiverRequests.length}
                  </span>
                </div>
              )}
            </button>

            <GroupChats />
          </>
        )}

        {isLoggedIn && (
          <div>
            <button
              className={classes["group-chat-form-button"]}
              onClick={() => toggleModal("groupChatForm")}
            >
              <IoMdAddCircle />
            </button>
            {activeModal === "groupChatForm" && (
              <GroupChatForm onToggle={() => toggleModal("groupChatForm")} />
            )}
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className={classes["user-info"]}>
          <div className={classes["user-info-left"]}>
            <div
              className={classes.avatar}
              style={{ backgroundColor: userInfo?.avatarColor || "#ccc" }}
            >
              {userInfo?.nickname.charAt(0)}
              <div
                className={
                  isLoggedIn ? classes["online-dot"] : classes["offline-dot"]
                }
              />
            </div>
            <p className={classes["user-info-nickname"]}>
              {userInfo?.nickname}
            </p>
          </div>
          <div className={classes["user-info-right"]}>
            <button
              className={classes["user-info-edit"]}
              onClick={userProfileEditHandler}
            >
              <IoMdSettings />
            </button>
            <button className={classes.logout} onClick={logoutHandler}>
              <LuLogOut />
            </button>
          </div>

          {activeModal === "editUserProfileForm" && (
            <EditUserProfileForm
              onToggle={() => toggleModal("editUserProfileForm")}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SideBar;
