import { Outlet } from "react-router-dom";

import DirectChatMainContent from "../components/DirectChats/DirectChatMainContent";
import NoAccess from "../components/Users/NoAccess";
import useAuthStore from "../store/authStore";

const DirectChatPage = () => {
  // const { isLoggedIn } = useAuthStore();

  // if (!isLoggedIn) {
  //   return (
  //     <NoAccess
  //       title="로그인이 필요합니다."
  //       description="로그인 하지 않은 사용자는 접근할 수 없습니다."
  //     />
  //   );
  // }

  return (
    <>
      <DirectChatMainContent>{<Outlet />}</DirectChatMainContent>
    </>
  );
};

export default DirectChatPage;
