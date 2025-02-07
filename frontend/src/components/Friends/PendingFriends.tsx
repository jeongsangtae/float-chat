import useAuthStore from "../../store/authStore";

const PendingFriends = ({
  sender,
  senderEmail,
  receiver,
  receiverEmail,
  status,
}) => {
  const { userInfo } = useAuthStore();

  const sendRequest = userInfo?._id === sender;

  return (
    <>
      {sendRequest ? (
        <ul>
          <li>{receiverEmail}</li>
          <li>{status}</li>
          <button>취소</button>
        </ul>
      ) : (
        <ul>
          <li>{senderEmail}</li>
          <li>{status}</li>
          <button>수락</button>
          <button>거절</button>
        </ul>
      )}
    </>
  );
};

export default PendingFriends;
