import { useNavigate } from "react-router-dom";

import { FriendUser } from "../../types";

import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";
import useDirectChatStore from "../../store/directChatStore";

const Friend = ({ id, userId, nickname }: FriendUser) => {
  const navigate = useNavigate();

  const { deleteFriend } = useFriendStore();
  const { getGroupChatInvites } = useGroupChatStore();
  const { getDirectChat, directChatForm } = useDirectChatStore();

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

    await directChatForm(id, nickname);

    // let directChatChecked = await getDirectChat(userId);

    // if (!directChatChecked) {
    //   // 기존 채팅방이 없으면 생성
    //   directChatChecked = await directChatForm(userId);
    // }

    // if (directChatChecked) {
    //   navigate(`/dm/${chatId}`);
    // }
  };

  return (
    <>
      <ul>
        <li>
          <button onClick={directChatHandler}>{nickname}</button>
          <button onClick={deleteFriendHandler}>삭제</button>
        </li>
      </ul>
    </>
  );
};

export default Friend;
