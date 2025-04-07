import { Link } from "react-router-dom";
import { DirectChatProps } from "../../types";

import useDirectChatStore from "../../store/directChatStore";

const DirectChat = ({ _id, otherUserNickname }: DirectChatProps) => {
  const { getDirectChat, closeDirectChat } = useDirectChatStore();

  const closeDirectChatHandler = async (): Promise<void> => {
    await closeDirectChat(_id);
    await getDirectChat();
  };

  return (
    <>
      <div>다이렉트 채팅방</div>
      <Link to={`${_id}`}>
        <div>{otherUserNickname}</div>
      </Link>
      <button onClick={closeDirectChatHandler}>닫기</button>
    </>
  );
};

export default DirectChat;
