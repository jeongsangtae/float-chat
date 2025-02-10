import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

const PendingFriends = ({
  friendRequestId,
  requester,
  requesterNickname,
  receiver,
  receiverNickname,
  status,
}) => {
  const { userInfo } = useAuthStore();
  const { acceptFriendRequest, rejectFriendRequest } = useFriendStore();

  const sendRequest = userInfo?._id === requester;

  const acceptFriendHandler = (friendRequestId) => {
    console.log(friendRequestId);
    acceptFriendRequest(friendRequestId);
  };

  const rejectFriendHandler = (friendRequestId) => {
    console.log(friendRequestId);
    rejectFriendRequest(friendRequestId);
  };

  return (
    <>
      {sendRequest ? (
        <ul>
          <li>{receiverNickname}</li>
          <li>{status}</li>
          <button
            onClick={() => {
              rejectFriendHandler(friendRequestId);
            }}
          >
            취소
          </button>
        </ul>
      ) : (
        <ul>
          <li>{requesterNickname}</li>
          <li>{status}</li>
          <button
            onClick={() => {
              acceptFriendHandler(friendRequestId);
            }}
          >
            수락
          </button>
          <button
            onClick={() => {
              rejectFriendHandler(friendRequestId);
            }}
          >
            거절
          </button>
        </ul>
      )}
    </>
  );
};

export default PendingFriends;
