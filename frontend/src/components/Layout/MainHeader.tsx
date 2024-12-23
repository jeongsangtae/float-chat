import { Link } from "react-router-dom";
import React, { useState } from "react";

import { ModalProps } from "../../types";
import Login from "../Users/Login";
import Signup from "../Users/Signup";
import CreateGroupChat from "../GroupChats/CreateGroupChat";

const MainHeader = () => {
  type ModalType = "login" | "signup" | "createGroupChat" | null;

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const toggleModalHandler = (modalType: ModalType) => {
    setActiveModal((prev) => (prev === modalType ? null : modalType));
  };

  const modals: {
    type: ModalType;
    label: string;
    component: React.ComponentType<ModalProps>;
  }[] = [
    { type: "login", label: "로그인 버튼", component: Login },
    { type: "signup", label: "회원가입 버튼", component: Signup },
    {
      type: "createGroupChat",
      label: "방 추가 버튼",
      component: CreateGroupChat,
    },
  ];

  return (
    <>
      <Link to="/me">메인 페이지</Link>/
      <Link to="/me/userId">다이렉트 채팅방</Link>/
      <Link to="/roomId">그룹 채팅방</Link>
      {modals.map(({ type, label, component: Component }) => (
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

export default MainHeader;
