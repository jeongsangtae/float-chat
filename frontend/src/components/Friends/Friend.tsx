import { useNavigate } from "react-router-dom";

import { FriendUser } from "../../types";

import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";
import useDirectChatStore from "../../store/directChatStore";

import classes from "./Friend.module.css";

const Friend = ({
  id,
  userId,
  nickname,
  avatarColor,
  avatarImageUrl,
  onlineChecked,
}: FriendUser) => {
  const navigate = useNavigate();

  const { deleteFriend } = useFriendStore();
  const { getGroupChatInvites } = useGroupChatStore();
  const { directChatForm } = useDirectChatStore();

  const deleteFriendHandler = async (): Promise<void> => {
    if (!userId) {
      console.error("userId가 정의되지 않았습니다.");
      return;
    }

    await deleteFriend(id, userId);
    await getGroupChatInvites();
  };

  // 함수 이름 변경 필요
  const directChatHandler = async (): Promise<void> => {
    if (!id) {
      console.error("id가 정의되지 않았습니다.");
      return;
    }

    const roomId = await directChatForm(
      id,
      nickname,
      avatarColor,
      avatarImageUrl
    );

    // if (directChatRoomId) {
    //   navigate(`/me/${directChatRoomId}`);
    // } else {
    //   console.error("채팅방 ID를 가져오지 못했습니다.");
    // }

    navigate(`/me/${roomId}`);
  };

  return (
    <li className={classes["friend-wrapper"]}>
      <div className={classes["friend-info"]} onClick={directChatHandler}>
        {avatarImageUrl ? (
          <img className={classes.avatar} src={avatarImageUrl} />
        ) : (
          <div
            className={classes.avatar}
            style={{ backgroundColor: avatarColor || "#ccc" }}
          >
            {nickname.charAt(0)}
            <div
              className={
                onlineChecked ? classes["online-dot"] : classes["offline-dot"]
              }
            />
          </div>
        )}
        <div className={classes["friend-nickname"]}>{nickname}</div>
      </div>
      <div className={classes["friend-buttons"]}>
        <button
          className={classes["friend-delete-button"]}
          onClick={deleteFriendHandler}
        >
          삭제
        </button>
      </div>
    </li>
  );
};

export default Friend;
