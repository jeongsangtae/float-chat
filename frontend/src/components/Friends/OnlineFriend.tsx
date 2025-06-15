import { useNavigate } from "react-router-dom";

import { FriendUser } from "../../types";

import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";
import useDirectChatStore from "../../store/directChatStore";

import classes from "./OnlineFriend.module.css";

const OnlineFriend = ({ id, userId, nickname, avatarColor }: FriendUser) => {
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

    const roomId = await directChatForm(id, nickname);

    navigate(`/me/${roomId}`);
  };

  return (
    <li className={classes["online-friend-wrapper"]}>
      <div
        className={classes.avatar}
        style={{ backgroundColor: avatarColor || "#ccc" }}
      >
        {nickname.charAt(0)}
        {/* <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          /> */}
      </div>
      <button onClick={directChatHandler}>{nickname}</button>
      <button onClick={deleteFriendHandler}>삭제</button>
    </li>
  );
};

export default OnlineFriend;
