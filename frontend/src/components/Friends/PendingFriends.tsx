import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

import classes from "./PendingFriends.module.css";

interface PendingFriendsProps {
  friendRequestId: string;
  requester: string;
  requesterNickname: string;
  requesterAvatarColor: string;
  receiver: string;
  receiverNickname: string;
  receiverAvatarColor: string;
  status: string;
}

const PendingFriends = ({
  friendRequestId,
  requester,
  requesterNickname,
  requesterAvatarColor,
  // receiver,
  receiverNickname,
  receiverAvatarColor,
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
        <li className={classes["pending-friend-wrapper"]}>
          <div
            className={classes.avatar}
            style={{ backgroundColor: receiverAvatarColor || "#ccc" }}
          >
            {receiverNickname.charAt(0)}
            {/* <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          /> */}
          </div>
          <div>{receiverNickname}</div>
          <div>{status}</div>
          <button onClick={rejectFriendHandler}>취소</button>
        </li>
      ) : (
        <li className={classes["pending-friend-wrapper"]}>
          <div
            className={classes.avatar}
            style={{ backgroundColor: requesterAvatarColor || "#ccc" }}
          >
            {requesterNickname.charAt(0)}
            {/* <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          /> */}
          </div>
          <div>{requesterNickname}</div>
          <div>{status}</div>
          <button onClick={acceptFriendHandler}>수락</button>
          <button onClick={rejectFriendHandler}>거절</button>
        </li>
      )}
    </>
  );
};

export default PendingFriends;
