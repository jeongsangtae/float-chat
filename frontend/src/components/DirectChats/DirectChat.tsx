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
      <div>다이렉트 채팅방 _id: {_id}</div>
      <Link to={`${_id}`}>
        <div>다른 사용자 닉네임: {otherUserNickname}</div>
      </Link>
      <button onClick={closeDirectChatHandler}>닫기</button>
    </>
  );
};

export default DirectChat;
