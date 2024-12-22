import { Link } from "react-router-dom";
import { useState } from "react";

import Login from "../Users/Login";
import Signup from "../Users/Signup";
import CreateGroupChat from "../GroupChats/CreateGroupChat";

const MainHeader = () => {
  type ModalType = "login" | "signup" | "createGroupChat" | null;

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const toggleModalHandler = (modalType: ModalType) => {
    setActiveModal((prev) => (prev === modalType ? null : modalType));
  };

  return (
    <>
      <Link to="/me">메인 페이지</Link>/
      <Link to="/me/userId">다이렉트 채팅방</Link>/
      <Link to="/roomId">그룹 채팅방</Link>
      <button onClick={() => toggleModalHandler("login")}>로그인 버튼</button>
      <button onClick={() => toggleModalHandler("signup")}>
        회원가입 버튼
      </button>
      <button onClick={() => toggleModalHandler("createGroupChat")}>
        방 추가 버튼
      </button>
      {activeModal === "login" && (
        <Login onToggle={() => toggleModalHandler("login")} />
      )}
      {activeModal === "signup" && (
        <Signup onToggle={() => toggleModalHandler("signup")} />
      )}
      {activeModal === "createGroupChat" && (
        <CreateGroupChat
          onToggle={() => toggleModalHandler("createGroupChat")}
        />
      )}
    </>
  );
};

export default MainHeader;
