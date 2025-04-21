import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";
import useSocketStore from "../../store/socketStore";

import { ModalProps, ModalType } from "../../types";
import GroupChats from "../GroupChats/GroupChats";
import Login from "../Users/Login";
import Signup from "../Users/Signup";
import GroupChatForm from "../GroupChats/GroupChatForm";

import classes from "./SideBar.module.css";

interface SideBarProps {
  onLeaveGroupChat: () => void;
}

const SideBar = ({ onLeaveGroupChat }: SideBarProps) => {
  const { isLoggedIn, userInfo, renewToken, refreshTokenExp, logout } =
    useAuthStore();
  const { activeModal, toggleModal } = useModalStore();
  const { disconnect } = useSocketStore();

  const navigate = useNavigate();

  const modals: {
    type: ModalType;
    label: string;
    component: React.ComponentType<ModalProps>;
  }[] = [
    { type: "login", label: "로그인", component: Login },
    { type: "signup", label: "회원가입", component: Signup },
    {
      type: "groupChatForm",
      label: "+",
      component: GroupChatForm,
    },
  ];

  const filteredModals = modals.filter(({ type }) => {
    if (isLoggedIn) {
      // 로그인 상태에서는 "login"과 "signup" 모달을 제외
      return type !== "login" && type !== "signup";
    }

    // 비로그인 상태에서는 "createGroupChat" 모달을 제외
    return type !== "groupChatForm";
  });

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

  const logoutHandler = async (): Promise<void> => {
    await logout();
    disconnect();
    navigate("/");
  };

  return (
    <div className={classes.sidebar}>
      {isLoggedIn && (
        <>
          <button onClick={onLeaveGroupChat}>아이콘 들어갈 위치</button>
          <GroupChats />
        </>
      )}

      {filteredModals.map(({ type, label, component: Component }) => (
        <div key={type}>
          <button onClick={() => toggleModal(type)}>{label}</button>
          {activeModal === type && (
            <Component onToggle={() => toggleModal(type)} />
          )}
        </div>
      ))}

      {isLoggedIn && (
        <div className={classes["user-info"]}>
          <p>{userInfo?.nickname}</p>
          <button onClick={logoutHandler}>로그아웃</button>
        </div>
      )}
    </div>
  );
};

export default SideBar;
