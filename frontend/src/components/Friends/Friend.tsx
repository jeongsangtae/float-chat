import { useNavigate } from "react-router-dom";

import { FriendUser } from "../../types";

import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";

import { getDirectChatRoomId } from "../../utils/getDirectChatRoomId";

import classes from "./Friend.module.css";
import Avatar from "../Users/Avatar";

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

  // 친구 삭제 처리
  const deleteFriendHandler = async (): Promise<void> => {
    if (!userId) {
      console.error("userId가 정의되지 않았습니다.");
      return;
    }

    await deleteFriend(id, userId);
    await getGroupChatInvites();
  };

  // 친구와의 다이렉트 채팅방으로 이동
  const openDirectChatHandler = async (): Promise<void> => {
    if (!id) {
      console.error("id가 정의되지 않았습니다.");
      return;
    }

    const payload = {
      id,
      nickname,
      avatarColor,
      avatarImageUrl,
    };

    // 다이렉트 채팅방 ID 조회
    const roomId = await getDirectChatRoomId(payload);

    navigate(`/me/${roomId}`);
  };

  return (
    <li className={classes["friend-wrapper"]}>
      <div className={classes["friend-info"]} onClick={openDirectChatHandler}>
        <Avatar
          nickname={nickname}
          avatarImageUrl={avatarImageUrl}
          avatarColor={avatarColor}
          onlineChecked={onlineChecked}
          showOnlineDot={true}
        />

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
