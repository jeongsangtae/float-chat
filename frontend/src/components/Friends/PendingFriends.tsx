import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

interface PendingFriendsProps {
  friendRequestId: string;
  requester: string;
  requesterNickname: string;
  receiver: string;
  receiverNickname: string;
  status: string;
}

const PendingFriends = ({
  friendRequestId,
  requester,
  requesterNickname,
  // receiver,
  receiverNickname,
  status,
}: PendingFriendsProps) => {
  const { userInfo } = useAuthStore();
  const { acceptFriendRequest, rejectFriendRequest } = useFriendStore();

  const sendRequest = userInfo?._id === requester;

  const acceptFriendHandler = (): void => {
    console.log(friendRequestId);
    acceptFriendRequest(friendRequestId);
  };

  const rejectFriendHandler = (): void => {
    console.log(friendRequestId);
    rejectFriendRequest(friendRequestId);
  };

  return (
    <>
      {sendRequest ? (
        <ul>
          <li>{receiverNickname}</li>
          <li>{status}</li>
          <button onClick={rejectFriendHandler}>취소</button>
        </ul>
      ) : (
        <ul>
          <li>{requesterNickname}</li>
          <li>{status}</li>
          <button onClick={acceptFriendHandler}>수락</button>
          <button onClick={rejectFriendHandler}>거절</button>
        </ul>
      )}
    </>
  );
};

export default PendingFriends;
