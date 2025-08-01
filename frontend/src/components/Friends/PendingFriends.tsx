import useFriendStore from "../../store/friendStore";

import classes from "./PendingFriends.module.css";

interface PendingFriendsProps {
  friendRequestId: string;
  nickname: string;
  avatarColor: string;
  sendRequest: boolean;
}

const PendingFriends = ({
  friendRequestId,
  nickname,
  avatarColor,
  sendRequest,
}: PendingFriendsProps) => {
  const { acceptFriendRequest, rejectFriendRequest } = useFriendStore();

  const acceptFriendHandler = (): void => {
    acceptFriendRequest(friendRequestId);
  };

  const rejectFriendHandler = (): void => {
    rejectFriendRequest(friendRequestId);
  };

  return (
    <>
      <li className={classes["pending-friend-wrapper"]}>
        <div className={classes["pending-friend-info"]}>
          <div
            className={classes.avatar}
            style={{ backgroundColor: avatarColor || "#ccc" }}
          >
            {nickname.charAt(0)}
          </div>
          <div className={classes["pending-friend-nickname"]}>{nickname}</div>
        </div>
        {sendRequest ? (
          <div className={classes["pending-friend-button"]}>
            <button
              className={classes["pending-friend-cancel-button"]}
              onClick={rejectFriendHandler}
            >
              취소
            </button>
          </div>
        ) : (
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
        )}
      </li>
    </>
  );
};

export default PendingFriends;
