import { Link } from "react-router-dom";

const MainHeader = () => {
  return (
    <>
      <Link to="/me">메인 페이지</Link>/
      <Link to="/me/userId">다이렉트 채팅방</Link>/
      <Link to="/roomId">그룹 채팅방</Link>
    </>
  );
};

export default MainHeader;
