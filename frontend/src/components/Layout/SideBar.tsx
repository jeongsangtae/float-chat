import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";

import { ModalProps } from "../../types";
import GroupChats from "../GroupChats/GroupChats";
import Login from "../Users/Login";
import Signup from "../Users/Signup";
import CreateGroupChat from "../GroupChats/CreateGroupChat";

const SideBar = () => {
  type ModalType = "login" | "signup" | "createGroupChat";
  // type ModalItem = {
  //   type: ModalType;
  //   label: string;
  //   component: React.ComponentType<ModalProps>;
  // };
  type ActiveModalType = ModalType | null;

  const { isLoggedIn, userInfo, pageAccess, logout } = useAuthStore();

  // 초기 상태: 모달 비활성화 상태 (null)
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  const toggleModalHandler = (modalType: ModalType) => {
    setActiveModal((prev) => (prev === modalType ? null : modalType));
  };

  // const modals: ModalItem[] = [
  //   { type: "login", label: "로그인", component: Login },
  //   { type: "signup", label: "회원가입", component: Signup },
  //   { type: "createGroupChat", label: "+", component: CreateGroupChat },
  // ];

  // const filteredModals = allModals.filter(({ type }) => {
  //   if (isLoggedIn && (type === "login" || type === "signup")) {
  //     return false;
  //   }
  //   return true;
  // });

  const modals: {
    type: ModalType;
    label: string;
    component: React.ComponentType<ModalProps>;
  }[] = [
    { type: "login", label: "로그인", component: Login },
    { type: "signup", label: "회원가입", component: Signup },
    { type: "createGroupChat", label: "+", component: CreateGroupChat },
  ];

  const filteredModals = modals.filter(({ type }) => {
    if (isLoggedIn && (type === "login" || type === "signup")) {
      return false;
    } else if (!isLoggedIn && type === "createGroupChat") {
      return false;
    }
    return true;
  });

  useEffect(() => {
    pageAccess();
  }, []);

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
          <button onClick={() => toggleModalHandler(type)}>{label}</button>
          {activeModal === type && (
            <Component onToggle={() => toggleModalHandler(type)} />
          )}
        </div>
      ))}
    </>
  );
};

export default SideBar;
