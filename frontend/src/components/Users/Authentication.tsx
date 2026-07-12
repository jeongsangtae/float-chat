import { useParams } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useDirectChatStore from "../../store/directChatStore";
import useGroupChatStore from "../../store/groupChatStore";

import { ChildrenProps } from "../../types";

import NoAccess from "./NoAccess";

const Authentication = ({ children }: ChildrenProps) => {
  const { roomId } = useParams();
  const { isLoggedIn } = useAuthStore();
  const { directChats } = useDirectChatStore();
  const { groupChats } = useGroupChatStore();

  // 접근 가능한 채팅방인지 확인
  const checkedRoom =
    !roomId ||
    directChats.some((directChat) => directChat._id === roomId) ||
    groupChats.some((groupChat) => groupChat._id === roomId);

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <>
        <NoAccess
          title="로그인이 필요합니다."
          description="로그인 하지 않은 사용자는 접근할 수 없습니다."
          label="로그인 하러가기"
          path="/login"
        />
      </>
    );
  }

  // 존재하지 않는 채팅방인 경우
  if (!checkedRoom) {
    return (
      <>
        <NoAccess
          title="존재하지 않는 채팅방입니다."
          description="요청하신 채팅방을 찾을 수 없습니다."
          label="홈으로 돌아가기"
          path="/"
        />
      </>
    );
  }

  return <>{children}</>;
};

export default Authentication;
