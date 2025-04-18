import { ReactNode } from "react";
import { useParams } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useDirectChatStore from "../../store/directChatStore";
import useGroupChatStore from "../../store/groupChatStore";

import NoAccess from "./NoAccess";

interface AuthenticationProps {
  children: ReactNode;
}

const Authentication = ({ children }: AuthenticationProps) => {
  const { roomId } = useParams();
  const { isLoggedIn } = useAuthStore();
  const { directChats } = useDirectChatStore();
  const { groupChats } = useGroupChatStore();

  const checkedRoom =
    !roomId ||
    directChats.some((directChat) => directChat._id === roomId) ||
    groupChats.some((groupChat) => groupChat._id === roomId);

  if (!isLoggedIn) {
    return (
      <NoAccess
        title="로그인이 필요합니다."
        description="로그인 하지 않은 사용자는 접근할 수 없습니다."
      />
    );
  }

  if (!checkedRoom) {
    return (
      <NoAccess
        title="존재하지 않는 채팅방입니다."
        description="요청하신 채팅방을 찾을 수 없습니다."
      />
    );
  }

  return <>{children}</>;
};

export default Authentication;
