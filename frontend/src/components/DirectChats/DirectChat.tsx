import { Link, useNavigate } from "react-router-dom";
import { DirectChatProps } from "../../types";

import useDirectChatStore from "../../store/directChatStore";
import useSocketStore from "../../store/socketStore";

const DirectChat = ({ _id, otherUserNickname }: DirectChatProps) => {
  const navigate = useNavigate();

  const { getDirectChat, closeDirectChat } = useDirectChatStore();
  const { currentRoom } = useSocketStore();

  const closeDirectChatHandler = async (): Promise<void> => {
    await closeDirectChat(_id);
    await getDirectChat();

    if (currentRoom === _id) {
      navigate("/");
    }
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
