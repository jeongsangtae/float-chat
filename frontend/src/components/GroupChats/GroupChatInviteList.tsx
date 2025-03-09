import { GroupChatInviteListProps } from "../../types";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

const GroupChatInviteList = ({
  groupChatId,
  groupChatInviteId,
  requester,
  requesterNickname,
  roomTitle,
}: GroupChatInviteListProps) => {
  const { userInfo } = useAuthStore();
  const { acceptGroupChatInvite, rejectGroupChatInvite } = useGroupChatStore();

  const acceptGroupChatInviteHandler = () => {
    acceptGroupChatInvite({ groupChatId, groupChatInviteId });
  };

  const rejectGroupChatInviteHandler = () => {
    rejectGroupChatInvite({ groupChatId, groupChatInviteId });
  };

  console.log(groupChatInviteId);

  const sendRequest = userInfo?._id === requester;

  return (
    <>
      <ul>
        <li>{requesterNickname}</li>
        <li>{roomTitle}</li>
        {!sendRequest && (
          <>
            <button onClick={acceptGroupChatInviteHandler}>수락</button>
            <button onClick={rejectGroupChatInviteHandler}>거절</button>
          </>
        )}
      </ul>
    </>
  );
};

export default GroupChatInviteList;
