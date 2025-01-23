import { useEffect } from "react";
import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";

import { ModalProps, ModalType } from "../../types";
import GroupChats from "../GroupChats/GroupChats";
import Login from "../Users/Login";
import Signup from "../Users/Signup";
import GroupChatForm from "../GroupChats/GroupChatForm";

const SideBar = () => {
  const { isLoggedIn, userInfo, renewToken, refreshTokenExp, logout } =
    useAuthStore();

  const { activeModal, toggleModal } = useModalStore();

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

  return (
    <>
      {isLoggedIn && (
        <>
          <p>{userInfo?.nickname}</p>
          <button onClick={logout}>로그아웃</button>
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
    </>
  );
};

export default SideBar;
