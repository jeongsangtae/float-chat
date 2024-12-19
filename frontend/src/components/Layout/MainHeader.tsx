import { Link } from "react-router-dom";
import { useState } from "react";

import CreateGroupChat from "../GroupChats/CreateGroupChat";

const MainHeader = () => {
  const [toggleModal, setToggleModal] = useState<boolean>(false);

  const ModalToggle = () => {
    setToggleModal(!toggleModal);
  };

  return (
    <>
      <Link to="/me">메인 페이지</Link>/
      <Link to="/me/userId">다이렉트 채팅방</Link>/
      <Link to="/roomId">그룹 채팅방</Link>
      <button onClick={ModalToggle}>방 추가 버튼</button>
      {toggleModal && <CreateGroupChat onToggle={ModalToggle} />}
    </>
  );
};

export default MainHeader;
