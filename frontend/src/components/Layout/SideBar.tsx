import { useState } from "react";

import { ModalProps } from "../../types";
import GroupChats from "../GroupChats/GroupChats";
import Login from "../Users/Login";
import Signup from "../Users/Signup";
import CreateGroupChat from "../GroupChats/CreateGroupChat";

const SideBar = () => {
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
    { type: "login", label: "로그인", component: Login },
    { type: "signup", label: "회원가입", component: Signup },
    {
      type: "createGroupChat",
      label: "+",
      component: CreateGroupChat,
    },
  ];

  return (
    <>
      <GroupChats />
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

export default SideBar;
