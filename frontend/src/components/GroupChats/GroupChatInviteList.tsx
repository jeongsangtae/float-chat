import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

interface GroupChatInviteListProps {
  groupChatInviteId: string;
  requester: string;
  requesterNickname: string;
  roomTitle: string;
}

const GroupChatInviteList = ({
  groupChatInviteId,
  requester,
  requesterNickname,
  roomTitle,
}: GroupChatInviteListProps) => {
  const { userInfo } = useAuthStore();
  const { acceptGroupChatInvite, rejectGroupChatInvite } = useGroupChatStore();

  const acceptGroupChatInviteHandler = () => {
    acceptGroupChatInvite(groupChatInviteId);
  };

  const rejectGroupChatInviteHandler = () => {
    rejectGroupChatInvite(groupChatInviteId);
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
