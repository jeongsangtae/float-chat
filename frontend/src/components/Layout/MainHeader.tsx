import { Link } from "react-router-dom";
import { useState } from "react";

import Login from "../Users/Login";
import Signup from "../Users/Signup";
import CreateGroupChat from "../GroupChats/CreateGroupChat";

const MainHeader = () => {
  const [loginModalToggle, setLoginModalToggle] = useState<boolean>(false);
  const [signupModalToggle, setSignupModalToggle] = useState<boolean>(false);
  const [createGroupChatToggleModal, setCreateGroupChatToggleModal] =
    useState<boolean>(false);
  // const [toggleModal, setToggleModal] = useState<boolean>(false);

  // const ModalToggle = () => {
  //   setToggleModal(!toggleModal);
  // };

  const loginModalToggleHandler = () => {
    setLoginModalToggle(!loginModalToggle);
  };

  const signupModalToggleHandler = () => {
    setSignupModalToggle(!signupModalToggle);
  };

  const createGroupChatModalToggleHandler = () => {
    setCreateGroupChatToggleModal(!createGroupChatToggleModal);
  };

  return (
    <>
      <Link to="/me">메인 페이지</Link>/
      <Link to="/me/userId">다이렉트 채팅방</Link>/
      <Link to="/roomId">그룹 채팅방</Link>
      <button onClick={loginModalToggleHandler}>로그인 버튼</button>
      <button onClick={signupModalToggleHandler}>회원가입 버튼</button>
      <button onClick={createGroupChatModalToggleHandler}>방 추가 버튼</button>
      {createGroupChatToggleModal && (
        <CreateGroupChat onToggle={createGroupChatModalToggleHandler} />
      )}
      {loginModalToggle && <Login onToggle={loginModalToggleHandler} />}
      {signupModalToggle && <Signup onToggle={signupModalToggleHandler} />}
    </>
  );
};

export default MainHeader;
