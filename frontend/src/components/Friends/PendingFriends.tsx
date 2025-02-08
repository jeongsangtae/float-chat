import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

const PendingFriends = ({
  friendRequestId,
  sender,
  senderEmail,
  receiver,
  receiverEmail,
  status,
}) => {
  const { userInfo } = useAuthStore();
  const { acceptFriendRequest, rejectFriendRequest } = useFriendStore();

  const sendRequest = userInfo?._id === sender;

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
          <li>{receiverEmail}</li>
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
          <li>{senderEmail}</li>
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
