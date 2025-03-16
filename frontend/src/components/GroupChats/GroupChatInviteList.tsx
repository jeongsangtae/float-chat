import { useNavigate } from "react-router-dom";

import { GroupChatInviteListProps } from "../../types";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

const GroupChatInviteList = ({
  groupChatId,
  groupChatInviteId,
  requester,
  requesterNickname,
  roomTitle,
  status,
}: GroupChatInviteListProps) => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { getGroupChats, acceptGroupChatInvite, rejectGroupChatInvite } =
    useGroupChatStore();

  const acceptGroupChatInviteHandler = async (): Promise<void> => {
    await acceptGroupChatInvite({ groupChatId, groupChatInviteId });

    // 그룹 채팅방 목록을 다시 가져와서 실시간 반영
    await getGroupChats();
  };

  const rejectGroupChatInviteHandler = async (): Promise<void> => {
    await rejectGroupChatInvite(groupChatInviteId);
  };

  const groupChatMoveHandler = (): void => {
    navigate(`/group-chat/${groupChatId}`);
  };

  const sendRequest = userInfo?._id === requester;
  const participant = status === "참여중";

  return (
    <>
      <ul>
        <li>{requesterNickname}</li>
        <li>{roomTitle}</li>
        {!sendRequest && !participant && (
          <>
            <button onClick={acceptGroupChatInviteHandler}>수락</button>
            <button onClick={rejectGroupChatInviteHandler}>거절</button>
          </>
        )}

        {!sendRequest && participant && (
          <button onClick={groupChatMoveHandler}>참여중</button>
        )}
      </ul>
    </>
  );
};

export default GroupChatInviteList;
