import { FriendUser } from "../../types";

import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";

const Friend = ({ id, userId, nickname }: FriendUser) => {
  const { deleteFriend } = useFriendStore();
  const { getGroupChatInvites } = useGroupChatStore();

  const deleteFriendHandler = async (): Promise<void> => {
    if (!userId) {
      console.error("userId가 정의되지 않았습니다.");
      return;
    }

    await deleteFriend(id, userId);
    await getGroupChatInvites();
  };

  return (
    <>
      <ul>
        <li>
          {nickname}
          <button onClick={deleteFriendHandler}>삭제</button>
        </li>
      </ul>
    </>
  );
};

export default Friend;
