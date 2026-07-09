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
import UserSettings from "../Users/UserSettings";

import classes from "./SideBar.module.css";
import GroupChatConfirm from "../GroupChats/GroupChatConfirm";
import Avatar from "../Users/Avatar";

interface SideBarProps {
  onLeaveChatRoom: () => void;
}

const SideBar = ({ onLeaveChatRoom }: SideBarProps) => {
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

  // 사용자 설정 모달 열기
  const userSettingHandler = (): void => {
    toggleModal("userSettings", "PATCH", {
      _id: userInfo?._id,
      nickname: userInfo?.nickname,
      avatarColor: userInfo?.avatarColor,
      avatarImageUrl: userInfo?.avatarImageUrl,
    });
  };

  // 로그아웃 처리
  const logoutHandler = async (): Promise<void> => {
    await logout();
    disconnect();
    navigate("/login");
  };

  // 내가 받은 친구 요청만 추출
  const receiverRequests = friendRequests.filter(
    (friendRequest) => friendRequest.receiver === userInfo?._id
  );

  return (
    <div className={classes.sidebar}>
      <div className={classes["sidebar-scroll"]}>
        <div className={classes["sidebar-top"]}>
          {isLoggedIn && (
            <>
              <button
                className={`${classes["home-button"]} ${
                  active ? classes.active : ""
                }`}
                onClick={onLeaveChatRoom}
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

          {/* 그룹 채팅방 생성 / 관리 */}
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

              {activeModal === "groupChatConfirm" && (
                <GroupChatConfirm
                  onToggle={() => toggleModal("groupChatConfirm")}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 로그인한 사용자 정보 */}
      {isLoggedIn && (
        <div className={classes["user-info"]}>
          <div className={classes["user-info-left"]}>
            <Avatar
              nickname={userInfo?.nickname ?? ""}
              avatarImageUrl={userInfo?.avatarImageUrl ?? null}
              avatarColor={userInfo?.avatarColor ?? null}
              onlineChecked={isLoggedIn}
              showOnlineDot={true}
            />

            <p className={classes["user-info-nickname"]}>
              {userInfo?.nickname}
            </p>
          </div>
          <div className={classes["user-info-right"]}>
            <button
              className={classes["user-info-edit"]}
              onClick={userSettingHandler}
            >
              <IoMdSettings />
            </button>
            <button className={classes.logout} onClick={logoutHandler}>
              <LuLogOut />
            </button>
          </div>

          {activeModal === "userSettings" && (
            <UserSettings onToggle={() => toggleModal("userSettings")} />
          )}
        </div>
      )}
    </div>
  );
};

export default SideBar;
