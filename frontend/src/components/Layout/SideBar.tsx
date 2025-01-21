import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";

import { ModalProps } from "../../types";
import GroupChats from "../GroupChats/GroupChats";
import Login from "../Users/Login";
import Signup from "../Users/Signup";
import GroupChatForm from "../GroupChats/GroupChatForm";

const SideBar = () => {
  type ModalType = "login" | "signup" | "groupChatForm";
  type ActiveModalType = ModalType | null;

  const { isLoggedIn, userInfo, renewToken, refreshTokenExp, logout } =
    useAuthStore();

  // 초기 상태: 모달 비활성화 상태 (null)
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  const toggleModalHandler = (modalType: ModalType) => {
    setActiveModal((prev) => (prev === modalType ? null : modalType));
  };

  const modals: {
    type: ModalType;
    label: string;
    component: React.ComponentType<ModalProps>;
    method?: "POST" | "PATCH";
  }[] = [
    { type: "login", label: "로그인", component: Login },
    { type: "signup", label: "회원가입", component: Signup },
    {
      type: "groupChatForm",
      label: "+",
      component: GroupChatForm,
      method: "POST",
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
          <GroupChats
            onToggle={() => toggleModalHandler("groupChatForm")}
            method="PATCH"
          />
        </>
      )}
      {filteredModals.map(({ type, label, component: Component, method }) => (
        <div key={type}>
          <button onClick={() => toggleModalHandler(type)}>{label}</button>
          {activeModal === type && (
            <Component
              onToggle={() => toggleModalHandler(type)}
              method={method}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default SideBar;
