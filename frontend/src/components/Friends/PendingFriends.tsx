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
          <div className={classes["pending-friend-info"]}>
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
            <div className={classes["pending-friend-nickname"]}>
              {receiverNickname}
            </div>
          </div>
          {/* <div>{status}</div> */}
          <div className={classes["pending-friend-button"]}>
            <button
              className={classes["pending-friend-cancel-button"]}
              onClick={rejectFriendHandler}
            >
              취소
            </button>
          </div>
        </li>
      ) : (
        <li className={classes["pending-friend-wrapper"]}>
          <div className={classes["pending-friend-info"]}>
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
            <div className={classes["pending-friend-nickname"]}>
              {requesterNickname}
            </div>
          </div>
          {/* <div>{status}</div> */}
          <div className={classes["pending-friend-buttons"]}>
            <button
              className={classes["pending-friend-accept-button"]}
              onClick={acceptFriendHandler}
            >
              수락
            </button>
            <button
              className={classes["pending-friend-reject-button"]}
              onClick={rejectFriendHandler}
            >
              거절
            </button>
          </div>
        </li>
      )}
    </>
  );
};

export default PendingFriends;
